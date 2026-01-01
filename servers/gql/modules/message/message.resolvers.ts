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
              roles: {
                select: {
                  role: true,
                },
              },
            },
          },
          MessageAttachment: true,
        },
        orderBy: { sentAt: "desc" }, // Get latest messages first
        skip: offset,
        take: limit,
      });

      // Reverse to maintain chronological order (oldest to newest) for display
      // Map to match GraphQL schema field names
      return messages.reverse().map((msg: any) => ({
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
            sender: { select: { id: true } },
            reciever: { select: { id: true } },
            ConversationParticipant: {
              include: {
                user: { select: { id: true } },
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

        const result = await prisma.$transaction(async (tx: any) => {
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
          attachments: (result.MessageAttachment || []).map((att: any) => ({
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

          const participantIds = new Set<string>();
          if (conversation.sender?.id) {
            participantIds.add(conversation.sender.id);
          }
          if (conversation.reciever?.id) {
            participantIds.add(conversation.reciever.id);
          }
          conversation.ConversationParticipant?.forEach((participant: any) => {
            const userId = participant.user?.id;
            if (userId) participantIds.add(userId);
          });

          console.log(`[BACKEND] 👥 All participant user IDs:`, Array.from(participantIds));
          console.log(`[BACKEND] 🔑 Current user ID:`, user.id);

          const userEmits: Promise<void>[] = [];
          for (const userId of participantIds) {
            if (!userId || userId === user.id) {
              console.log(`[BACKEND] ⏭️  Skipping user ID: ${userId} (${userId === user.id ? 'is sender' : 'invalid'})`);
              continue;
            }
            console.log(`[BACKEND] 📤 Publishing message to user channel: user:${userId}`);

            userEmits.push(
              realtime
                .channel(`user:${userId}`)
                .emit("message.newMessage", realtimePayload)
                .catch((error) => {
                  console.error(
                    `[BACKEND] ⚠️ Failed to publish user-level message notification for ${userId}:`,
                    error
                  );
                })
            );
          }
          await Promise.all(userEmits);
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

        const buyerName =
          `${result.sender?.firstName || ""} ${result.sender?.lastName || ""
            }`.trim() || "A buyer";

        createAndPushNotification({
          userId: receiverId,
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
