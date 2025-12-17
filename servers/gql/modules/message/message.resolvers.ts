// servers/gql/messageResolvers.ts
import { createAndPushNotification } from "@/lib/notification";
import { NewMessagePayload, realtime } from "@/lib/realtime";
import { GraphQLContext } from "../../context";

export const messageResolvers = {
  Query: {
    messages: async (
      _parent: any,
      {
        conversationId,
        limit = 50,
        offset = 0,
      }: { conversationId: string; limit?: number; offset?: number },
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) {
        throw new Error("Unauthorized: User must be logged in.");
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { senderId: true, recieverId: true },
      });

      if (!conversation) {
        throw new Error("Conversation not found.");
      }

      const isParticipant =
        conversation.senderId === user.id ||
        conversation.recieverId === user.id;

      if (!isParticipant) {
        throw new Error("Unauthorized: You are not a participant.");
      }

      const messages = await prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              clerkId: true,
              roles: {
                select: {
                  role: true,
                },
              },
            },
          },
          MessageAttachment: true,
        },
        orderBy: { sentAt: "asc" },
        skip: offset,
        take: limit,
      });

      // Map to match GraphQL schema field names
      return messages.map((msg) => ({
        ...msg,
        attachments: msg.MessageAttachment || [],
      }));
    },
  },
  Mutation: {
    sendMessage: async (
      _parent: any,
      {
        input,
      }: {
        input: {
          conversationId: string;
          content?: string;
          type: string;
          clientId?: string;
          attachments?: Array<{ url: string; type: string }>;
        };
      },
      { prisma, user }: GraphQLContext
    ): Promise<any> => {
      try {
        console.log('[BACKEND] 📨 sendMessage resolver called with input:', input);
        console.log('[BACKEND] 👤 User:', user);

        if (!user) {
          console.error('[BACKEND] ❌ Unauthorized: No user in context');
          throw new Error("Unauthorized: User must be logged in.");
        }

        const {
          conversationId,
          content,
          clientId,
          type,
          attachments = [],
        } = input;

        const prismaType =
          (type?.toUpperCase() as "TEXT" | "IMAGE" | "VIDEO" | "SYSTEM") ??
          "TEXT";

        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            sender: { select: { id: true, clerkId: true } },
            reciever: { select: { id: true, clerkId: true } },
            ConversationParticipant: {
              include: {
                user: { select: { id: true, clerkId: true } },
              },
            },
          },
        });

        if (!conversation) {
          throw new Error("Conversation not found.");
        }

        const isParticipant =
          conversation.senderId === user.id ||
          conversation.recieverId === user.id;
        if (!isParticipant) {
          throw new Error("Unauthorized: You are not a participant.");
        }

        const result = await prisma.$transaction(async (tx) => {
          const message = await tx.message.create({
            data: {
              conversationId,
              senderId: user.id,
              content: content || null,
              type: prismaType,
              clientId,
              fileUrl: attachments.length > 0 ? null : undefined,
              isRead: false,
              sentAt: new Date(),
            },
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  clerkId: true,
                  roles: {
                    select: {
                      role: true,
                    },
                  },
                },
              },
              MessageAttachment: true,
            },
          });

          if (attachments.length > 0) {
            await tx.messageAttachment.createMany({
              data: attachments.map((att) => {
                // Fallback: If type is DOCUMENT (or anything else not supported by Prisma), map to IMAGE
                // This prevents Prisma from crashing since the DB Enum only supports IMAGE | VIDEO
                const prismaType = (att.type === "VIDEO") ? "VIDEO" : "IMAGE";
                return {
                  messageId: message.id,
                  url: att.url,
                  type: prismaType,
                };
              }),
            });

            const messageWithAttachments = await tx.message.findUnique({
              where: { id: message.id },
              include: {
                sender: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    clerkId: true,
                    roles: {
                      select: {
                        role: true,
                      },
                    },
                  },
                },
                MessageAttachment: true,
              },
            });

            return messageWithAttachments;
          }

          return message;
        });

        if (!result) throw new Error("Unable to save message in database");

        // Map for GraphQL response
        const graphqlResult = {
          ...result,
          attachments: result.MessageAttachment || [],
        };

        const realtimePayload: NewMessagePayload = {
          id: result.id,
          conversationId,
          content: result.content || "",
          type: result.type,
          clientId,
          fileUrl: result.fileUrl || null,
          isRead: result.isRead,
          sentAt: result.sentAt, // <-- keep as Date
          sender: result.sender,
          attachments: (result.MessageAttachment || []).map((att) => ({
            id: att.id,
            url: att.url,
            type: att.type,
          })),
        };

        try {
          console.log(`[BACKEND] 📤 Publishing message to conversation channel: conversation:${conversationId}`);
          await realtime
            .channel(`conversation:${conversationId}`)
            .emit("message.newMessage", realtimePayload);

          const participantClerkIds = new Set<string>();
          if (conversation.sender?.clerkId) {
            participantClerkIds.add(conversation.sender.clerkId);
          }
          if (conversation.reciever?.clerkId) {
            participantClerkIds.add(conversation.reciever.clerkId);
          }
          conversation.ConversationParticipant?.forEach((participant) => {
            const clerkId = participant.user?.clerkId;
            if (clerkId) participantClerkIds.add(clerkId);
          });

          console.log(`[BACKEND] 👥 All participant clerk IDs:`, Array.from(participantClerkIds));
          console.log(`[BACKEND] 🔑 Current user clerk ID:`, user.clerkId);

          for (const clerkId of participantClerkIds) {
            if (!clerkId || clerkId === user.clerkId) {
              console.log(`[BACKEND] ⏭️  Skipping clerk ID: ${clerkId} (${clerkId === user.clerkId ? 'is sender' : 'invalid'})`);
              continue;
            }
            console.log(`[BACKEND] 📤 Publishing message to user channel: user:${clerkId}`);

            // We don't await this one to avoid slowing down the response too much if one fails
            realtime
              .channel(`user:${clerkId}`)
              .emit("message.newMessage", realtimePayload)
              .catch((error) => {
                console.error(
                  `[BACKEND] ⚠️ Failed to publish user-level message notification for ${clerkId}:`,
                  error
                );
              });
          }
        } catch (error) {
          console.error('[BACKEND] ⚠️ Realtime publishing failed (non-fatal):', error);
          // We continue execution so the message is still returned to the user
        }

        const receiverId =
          conversation.senderId === user.id
            ? conversation.recieverId
            : conversation.senderId;

        console.log("sender id-->", conversation.recieverId);
        console.log("rec id-->", conversation.senderId);
        console.log("cons sender id-->", conversation.sender.id);
        console.log("cons reciever clerkid-->", conversation.reciever.clerkId);

        console.log("reciever id--->", conversation.reciever.clerkId);

        const buyerName =
          `${result.sender?.firstName || ""} ${result.sender?.lastName || ""
            }`.trim() || "A buyer";

        createAndPushNotification({
          userId: receiverId,
          recieverClerkId: conversation.reciever.clerkId,
          title: "New Message",
          body: `${buyerName} sent you a message`,
          type: "NEW_MESSAGE",
        }).catch((error) => {
          console.error("Failed to send push notification:", error);
        });


        await prisma.conversationParticipant.updateMany({
          where: {
            conversationId,
            userId: { not: user.id },
          },
          data: { lastReadAt: null },
        });

        console.log('[BACKEND] ✅ Returning message to client:', { ...graphqlResult, clientId });
        return { ...graphqlResult, clientId };
      } catch (error) {
        console.error('[BACKEND] 💥 Error in sendMessage resolver:', error);
        console.error('[BACKEND] 💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        throw error;
      }
    },
  },
};
