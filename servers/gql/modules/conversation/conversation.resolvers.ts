import { GraphQLContext } from "../../context";

export const conversationResolvers = {
  Query: {
    conversationByProduct: async (
      _parent: any,
      { productId }: { productId: string },
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) throw new Error("Unauthorized");

      // Find an active conversation between this user and the product seller
      const conversation = await prisma.conversation.findFirst({
        where: {
          productId,
          OR: [{ senderId: user.id }, { recieverId: user.id }],
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
              avatarImageUrl: true,
            },
          },
          reciever: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarImageUrl: true,
            },
          },
        },
      });

      if (!conversation) return null;

      const participantRaw = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId: conversation.id,
            userId: user.id,
          },
        },
      });

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          senderId: { not: user.id },
          isRead: false,
        },
      });

      return {
        ...conversation,
        unreadCount,
      };
    },
    conversations: async (
      _parent: any,
      _args: any,
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) throw new Error("Unauthorized");

      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [{ senderId: user.id }, { recieverId: user.id }],
          isActive: true, // Only fetch active chats
        },
        include: {
          product: { select: { id: true, name: true, slug: true } },
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarImageUrl: true,
            },
          },
          reciever: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarImageUrl: true,
            },
          },
          ConversationParticipant: {
            where: { userId: user.id },
          },
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarImageUrl: true,
                },
              },
            },
            orderBy: { sentAt: "desc" },
            take: 1, // Get the latest message for preview
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      // Transform to match the schema
      const conversationsWithUnread = await Promise.all(
        conversations.map(async (conv: any) => {
          const participant = conv.ConversationParticipant?.[0];
          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: user.id },
              isRead: false,
            },
          });

          return {
            ...conv,
            lastMessage: conv.messages?.[0],
            unreadCount,
          };
        })
      );

      return conversationsWithUnread;
    },
  },
  Mutation: {
    markAsRead: async (
      _parent: any,
      { conversationId }: { conversationId: string },
      { prisma, user }: GraphQLContext
    ) => {
      if (!user) throw new Error("Unauthorized");

      await prisma.conversationParticipant.upsert({
        where: {
          conversationId_userId: {
            conversationId,
            userId: user.id,
          },
        },
        update: {
          lastReadAt: new Date(),
        },
        create: {
          conversationId,
          userId: user.id,
          lastReadAt: new Date(),
        },
      });

      // Mark individual messages as read too
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: user.id },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return true;
    },
    createConversation: async (
      _parent: any,
      { input }: { input: { productId: string } },
      ctx: GraphQLContext
    ): Promise<any> => {
      // Ensure user is authenticated
      if (!ctx.user) throw new Error("Unauthorized");

      const { prisma, user } = ctx;
      const { productId } = input;

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, sellerId: true },
      });

      if (!product) throw new Error("Product not found.");

      // Determine roles
      const senderId = user.id;
      const recieverId = product.sellerId;

      if (senderId === recieverId) {
        throw new Error("You cannot chat with yourself.");
      }

      // 1. Check if conversation already exists (idempotency)
      const existing = await prisma.conversation.findFirst({
        where: {
          productId,
          OR: [
            { AND: [{ senderId: senderId }, { recieverId: recieverId }] },
            { AND: [{ senderId: recieverId }, { recieverId: senderId }] }, // Handle case where seller started it
          ],
        },
      });

      if (existing) {
        if (!existing.isActive) {
          // Reactivate if needed
          return await prisma.conversation.update({
            where: { id: existing.id },
            data: { isActive: true },
          });
        }
        return existing;
      }

      // 2. Create new
      return await prisma.$transaction(
        async (tx) => {
          const newConversation = await tx.conversation.create({
            data: {
              productId,
              senderId,
              recieverId,
              title: `Inquiry about ${product.name}`,
              isActive: true,
            },
            include: {
              product: true,
              sender: true,
              reciever: true,
            },
          });

          await tx.conversationParticipant.createMany({
            data: [
              { conversationId: newConversation.id, userId: senderId },
              { conversationId: newConversation.id, userId: recieverId },
            ],
            skipDuplicates: true,
          });

          return newConversation;
        },
        {
          timeout: 15000,
        }
      );
    },
  },
};
