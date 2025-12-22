// lib/context.ts (or wherever you create context)
import redisConfig from "@/config/redis";
import { prisma } from "../../lib/db/prisma";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Updated context type
export interface GraphQLContext {
  prisma: typeof prisma;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    roles: string[];
    phoneVerified: boolean;
  } | null;
  publish: (evt: {
    type: string;
    payload: unknown;
    room?: string;
  }) => Promise<void>;
}

export async function createContext(
  request?: NextRequest
): Promise<GraphQLContext> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    let user = null;

    if (session) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          phoneVerified: true,
          roles: {
            select: { role: true },
          },
        },
      });

      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          roles: dbUser.roles.map((r) => r.role),
          firstName: dbUser.firstName ?? "",
          lastName: dbUser.lastName ?? "",
          phone: dbUser.phone,
          phoneVerified: dbUser.phoneVerified,
        };
      }
    }

    return {
      prisma,
      user,
      publish: async (evt) => {
        if (!redisConfig.publisher) {
          console.warn(
            "Redis publisher not available — event dropped:",
            evt.type
          );
          return;
        }
        try {
          await redisConfig.publisher.publish("events", JSON.stringify(evt));
        } catch (err) {
          console.error("Failed to publish event:", err);
        }
      },
    };
  } catch (error) {
    console.error("Error creating GraphQL context:", error);
    return {
      prisma,
      user: null,
      publish: async () => {
        console.warn("Publish called but context failed to initialize");
      },
    };
  }
}
