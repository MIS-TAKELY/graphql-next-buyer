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
    phoneNumber?: string | null;
    roles: string[];
    emailVerified: boolean;
    phoneNumberVerified: boolean;
    isBanned: boolean;
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
    let session = null;
    try {
      session = await auth.api.getSession({
        headers: await headers(),
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'digest' in error && error.digest === "DYNAMIC_SERVER_USAGE") {
        // Ignore headers during static generation
      } else {
        throw error;
      }
    }

    let user = null;

    if (session && session.user && session.user.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          phoneNumberVerified: true,
          isBanned: true,
          roles: {
            select: { role: true },
          },
        },
      });

      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          emailVerified: dbUser.emailVerified,
          roles: dbUser.roles.map((r: any) => r.role),
          firstName: dbUser.firstName ?? "",
          lastName: dbUser.lastName ?? "",
          phoneNumber: dbUser.phoneNumber,
          phoneNumberVerified: dbUser.phoneNumberVerified,
          isBanned: dbUser.isBanned,
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
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'digest' in error && error.digest !== "DYNAMIC_SERVER_USAGE") {
      console.error("Error creating GraphQL context:", error);
    }
    return {
      prisma,
      user: null,
      publish: async () => {
        console.warn("Publish called but context failed to initialize");
      },
    };
  }
}
