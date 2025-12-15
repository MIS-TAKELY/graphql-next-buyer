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
          messages: {
            take: 1, // Only need to check existence, messages fetched separately
          },
        },
      });

      return conversation;
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
      return conversations.map((conv) => ({
        ...conv,
        lastMessage: conv.messages[0],
        unreadCount: 0, // Placeholder, can be implemented later
      }));
    },
  },
  Mutation: {
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
      return await prisma.$transaction(async (tx) => {
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
        });

        return newConversation;
      });
    },
  },
};
