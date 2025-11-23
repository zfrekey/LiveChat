import { FastifyInstance } from "fastify";
import { Server } from "socket.io";
import { randomUUID } from "crypto";
import {
  ChatMessage,
  TypedIOServer,
  SocketData,
} from "./types/socket";

const DEFAULT_ROOM = "redes-chat";

export function setupSocketIO(fastify: FastifyInstance): TypedIOServer {
  const io: TypedIOServer = new Server(fastify.server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const socketId = socket.id;

    fastify.log.info(`[INFO] Socket ${socketId} connected.`);
    fastify.log.info("[INFO] Connected to the Server.");

    socket.on("join", ({ nickname, room }) => {
      const safeNickname = nickname?.trim() || "Anônimo";
      const roomName = room?.trim() || DEFAULT_ROOM;

      socket.data.nickname = safeNickname;
      socket.data.room = roomName;
      socket.join(roomName);

      fastify.log.info(
        `[INFO] Local user (${safeNickname}) joining room “${roomName}”. Attempting to connect...`
      );

      const msg: ChatMessage = {
        id: randomUUID(),
        author: "Sistema",
        text: `${safeNickname} entrou no chat.`,
        time: new Date().toLocaleTimeString(),
      };

      socket.to(roomName).emit("system-message", msg);

      fastify.log.info("[INFO] Remote user joined the chat.");
    });

    socket.on("chat-message", ({ text }) => {
      const room = socket.data.room || DEFAULT_ROOM;
      const nickname = socket.data.nickname || "Anônimo";
      const trimmed = text.trim();
      if (!trimmed) return;

      const messageId = randomUUID();
      const byteLength = Buffer.byteLength(trimmed, "utf-8");

      const message: ChatMessage = {
        id: messageId,
        author: nickname,
        text: trimmed,
        time: new Date().toLocaleTimeString(),
      };

      fastify.log.info(
        `[INFO] Local user sending message: “${trimmed}” (Length: ${byteLength} bytes).`
      );

      io.to(room).emit("chat-message", message);

      socket.emit("message-ack", {
        id: messageId,
        status: "delivered",
      });

      fastify.log.info(
        `[SUCCESS] ACK received: Message ID ${messageId} (Delivered).`
      );
    });

    socket.on("typing", ({ isTyping }) => {
      const room = socket.data.room;
      const nickname = socket.data.nickname || "Alguém";
      if (!room) return;

      io.to(room).emit("typing", { nickname, isTyping });

      fastify.log.info(
        `[INFO] User “${nickname}” is ${isTyping ? "typing..." : "not typing."}`
      );
    });

    socket.on("disconnect", (reason) => {
      const nickname = socket.data.nickname || "Desconhecido";
      const room = socket.data.room || DEFAULT_ROOM;

      fastify.log.warn(
        `[INFO] Local user disconnected from the chat. Reason: “${reason}”`
      );

      const msg: ChatMessage = {
        id: randomUUID(),
        author: "Sistema",
        text: `${nickname} saiu do chat.`,
        time: new Date().toLocaleTimeString(),
      };

      socket.to(room).emit("system-message", msg);

      fastify.log.warn(
        `[WARNING] Remote user disconnected from the chat. Reason: “${reason}”`
      );
    });
  });

  return io;
}
