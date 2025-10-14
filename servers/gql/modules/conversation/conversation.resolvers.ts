import { GraphQLContext } from "../../context";

export const conversationResolvers = {
  Query: {
    conversationByProduct: async (
      _parent: any,
      { productId }: { productId: string; userId: string },
      { prisma, user }: GraphQLContext
    ) => {
      // Fetch the active conversation for this product and buyer

      if (!user) throw new Error("User id not avilable");
      const conversation = await prisma.conversation.findFirst({
        where: {
          productId,
          senderId: user.id,
          isActive: true,
        },
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
          sender: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          reciever: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          ConversationParticipant: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
          messages: {
            orderBy: { sentAt: "asc" },
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
              // attachments: true,
            },
          },
        },
      });

      return conversation;
    },
  },
  Mutation: {
    createConversation: async (
      _parent: any,
      { input }: { input: { productId: string } },
      { prisma, user, publish }: GraphQLContext
    ): Promise<any> => {
      if (!user || user.role !== "BUYER") {
        throw new Error(
          "Unauthorized: Only buyers can initiate conversations."
        );
      }

      const { productId } = input;
      const senderId = user.id;

      // Fetch product and its seller
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, sellerId: true },
      });

      if (!product) {
        throw new Error("Product not found.");
      }

      const recieverId = product.sellerId;
      if (senderId === recieverId) {
        throw new Error("Cannot start a conversation with yourself.");
      }

      // Check for existing conversation
      let conversation = await prisma.conversation.findUnique({
        where: {
          senderId_recieverId_productId: { senderId, recieverId, productId },
        },
        include: {
          ConversationParticipant: true,
        },
      });

      if (conversation) {
        // If exists and active, return it (reuse)
        if (!conversation.isActive) {
          throw new Error("Conversation is inactive.");
        }
        return conversation;
      }

      // Create new conversation (transaction for atomicity)
      const result = await prisma.$transaction(
        async (tx) => {
          // Create conversation
          const newConversation = await tx.conversation.create({
            data: {
              productId,
              senderId,
              recieverId,
              title: `Chat about ${product.name}`, // Auto-generate title
              isActive: true,
            },
            include: {
              product: { select: { id: true, name: true, slug: true } },
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              reciever: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              ConversationParticipant: true,
            },
          });

          // Add participants if not already (shouldn't be, since new)
          await tx.conversationParticipant.createMany({
            data: [
              { conversationId: newConversation.id, userId: senderId },
              { conversationId: newConversation.id, userId: recieverId },
            ],
            skipDuplicates: true, // Safe in case of retry
          });

          // Refetch with participants
          return tx.conversation.findUnique({
            where: { id: newConversation.id },
            include: {
              product: { select: { id: true, name: true, slug: true } },
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              reciever: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              ConversationParticipant: {
                include: {
                  user: {
                    select: { id: true, firstName: true, lastName: true },
                  },
                },
              },
            },
          });
        },
        {
          timeout: 30000,
        }
      );

      // Optional: Publish to Upstash for real-time notification to seller
      if (result) {
        const channel = `conversation:${result.id}`;
        const realtimeEvent = {
          type: "CONVERSATION_CREATED",
          payload: {
            conversation: {
              ...result,
              createdAt: result.createdAt.toISOString(),
            },
          },
        };
        try {
          await publish({ channel, message: realtimeEvent }); // From your context
        } catch (error) {
          console.error("Failed to publish conversation creation:", error);
        }
      }

      return result;
    },
  },
};

// Merge: export const resolvers = { ...messageResolvers, ...conversationResolvers };
