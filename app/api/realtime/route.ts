import { realtime } from "@/lib/realtime"; // Adjust path if needed
import { handle } from "@upstash/realtime";

// Optional: Custom max duration for serverless (e.g., Vercel)
// Reduced to 60 seconds to prevent blocking the app
export const maxDuration = 60;

export const GET = handle({ realtime });

