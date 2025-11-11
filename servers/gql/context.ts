import { prisma } from "@/lib/db/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export interface GraphQLContext {
  prisma: typeof prisma;
  user?: { id: string; clerkId: string; email: string; role: string } | null;
  publish: (evt: { channel: string; message: unknown }) => Promise<void>;
}

export async function createContext(
  request: NextRequest
): Promise<GraphQLContext> {
  try {
    const { userId } = await getAuth(request);
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, clerkId: true, email: true, role: true },
      });
    }

    // console.log("user id-->", userId);
    // console.log("user-->", user);

    return {
      prisma,
      user,
      publish: async ({ channel, message }) => {
        const url = `${
          process.env.UPSTASH_REALTIME_REST_URL
        }/publish/${encodeURIComponent(channel)}`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.UPSTASH_REALTIME_REST_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });
        if (!res.ok) {
          console.error("Failed to publish to Realtime:", await res.text());
        }
      },
    };
  } catch (error) {
    console.error("Error creating GraphQL context:", error);
    return {
      prisma,
      user: null,
      publish: async () => {},
    };
  }
}
