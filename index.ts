//index.ts

import "dotenv/config"; // Load .env vars first
import express from "express";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import redisConfig from "./config/redis"; // Remove .ts extension if not needed

const app = express();
const httpServer = createServer(app);

const io = new IOServer(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://graphql-next-buyer-hmu9c58z1-mailitttome-4974s-projects.vercel.app",
            "https://graphql-next-buyer.vercel.app",
          ]
        : ["http://localhost:3000"],
    credentials: true,
  },
});

// Use redis from config
const redisSub = redisConfig.redis;

if (redisSub) {
  // Subscribe to Redis channel and forward to sockets
  redisSub.subscribe("events").catch((err) => {
    console.error("Failed to subscribe to Redis channel:", err);
  });

  redisSub.on("message", (_channel, raw) => {
    try {
      const evt = JSON.parse(raw);
      const { type, payload, room } = evt;
      if (room) io.to(room).emit(type, payload);
      else io.emit(type, payload);
    } catch (e) {
      console.error("Invalid event payload:", raw);
    }
  });
} else {
  console.warn("Redis subscriber not available; events won't be processed.");
}

// Optional: authenticate users via Clerk token passed in the handshake
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    // TODO: verify token with Clerk if you need auth
    // const session = await clerkClient.verifyToken(token) ...
    // socket.data.userId = session.sub
    return next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.on("join", (room: string) => socket.join(room));
  socket.on("disconnect", () => {});
});

const port = process.env.PORT || 4001;
httpServer.listen(port, () => console.log(`Socket.IO server on :${port}`));
