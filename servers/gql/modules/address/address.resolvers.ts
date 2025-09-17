import { AddressType } from "@/app/generated/prisma";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "../../auth/auth";
import { GraphQLContext } from "../../context";

export const addressResolvers = {
  Query: {
    getAddress: async (_: any, __: any, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      const userId = user.id;
      if (!userId) throw new Error("user Id not found");
      return prisma.address.findMany({
        include: {
          user: true,
        },
      });
    },
    getAddressOfUser: async (_: any, __: any, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      const userId = user.id;
      if (!userId) throw new Error("user Id not found");
      return prisma.address.findMany({
        where: {
          userId,
        },
        include: {
          user: true,
        },
      });
    },
  },
  Mutation: {
    addAddress: async (
      _: any,
      {
        input,
      }: {
        input: {
          type: AddressType;
          label: string;
          line1: string;
          line2: string;
          city: string;
          state: string;
          country: string;
          postalCode: string;
          phone: string;
          isDefault: boolean;
        };
      },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireAuth(ctx);
        const userId = user.id;
        if (!userId) throw new Error("user Id not found");
        const createAddressResponse = await prisma.address.create({
          data: {
            type: input.type,
            label: input.label,
            line1: input.line1,
            line2: input.line2,
            city: input.city,
            state: input.state,
            country: input.country,
            postalCode: input.postalCode,
            phone: input.phone,
            isDefault: input.isDefault,
            user: {
              connect: { id: userId },
            },
          },
        });
        if (!createAddressResponse) throw new Error("Unable to create Address");
        return true;
      } catch (error: any) {
        // console.log("Error occured while creating address", error.message);
        console.error(error);
        return false;
      }
    },
    updateAddress: async (
      _: any,
      {
        input,
      }: {
        input: {
          id: string;
          type: AddressType;
          label: string;
          line1: string;
          line2: string;
          city: string;
          state: string;
          country: string;
          postalCode: string;
          phone: string;
          isDefault: boolean;
        };
      },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireAuth(ctx);
        const userId = user.id;
        if (!userId) throw new Error("user Id not found");
        const data: Record<string, any> = {};
        Object.entries(input).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === "string" && value.trim() !== "") {
              data[key] = value.trim();
            } else {
              data[key] = value;
            }
          }
        });
        const createAddressResponse = await prisma.address.update({
          where: {
            id: input.id,
          },
          data,
        });
        if (!createAddressResponse) throw new Error("Unable to update Address");
        return true;
      } catch (error: any) {
        // console.log("Error occured while updating address", error.message);
        console.error(error);
        return false;
      }
    },
    deleteAddressById: async (
      _: any,
      { id }: { id: string },
      ctx: GraphQLContext
    ) => {
      try {
        const user = requireAuth(ctx);
        const userId = user.id;
        if (!userId) throw new Error("user id not found");

        const deleteAddressRespone = await prisma.address.delete({
          where: {
            id,
            userId,
          },
        });
        if (!deleteAddressRespone)
          throw new Error("Internal server error unable to delete the address");
        return true;
      } catch (error: any) {
        // console.log("Error occured while deleting address", error.message);
        console.error(error);
        return false;
      }
    },
  },
};
