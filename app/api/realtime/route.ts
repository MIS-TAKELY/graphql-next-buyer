import { realtime } from "@/lib/realtime"; // Adjust path if needed
import { handle } from "@upstash/realtime";

// Optional: Custom max duration for serverless (e.g., Vercel)
// Reduced to 60 seconds to prevent blocking the app
export const maxDuration = 60;

export const GET = handle({ realtime });

// Optional: Add auth middleware if needed
// export const GET = handle({
//   realtime,
//   middleware: async ({ request, channel }) => {
//     // Example: Auth check
//     const user = await getCurrentUser(request); // Your auth logic
//     if (channel !== user?.id) {
//       return new Response("Unauthorized", { status: 401 });
//     }
//   },
// });
