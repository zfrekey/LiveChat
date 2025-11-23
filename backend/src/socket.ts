import { FastifyInstance } from "fastify";
import { Server } from "socket.io";
import { randomUUID } from "crypto";
import {
  ChatMessage,
  SocketData,
  TypedIOServer,
} from "./types/socket";

const DEFAULT_ROOM = "redes-chat";

export function setupSocketIO(fastify: FastifyInstance): TypedIOServer {
  const io: TypedIOServer = new Server<
    any,
    any,
    any,
    SocketData
  >(fastify.server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    fastify.log.info(`Novo cliente conectado: ${socket.id}`);

    socket.on("join", ({ nickname, room }) => {
      const safeNickname = nickname?.trim() || "Anônimo";
      const roomName = room?.trim() || DEFAULT_ROOM;

      socket.data.nickname = safeNickname;
      socket.data.room = roomName;
      socket.join(roomName);

      fastify.log.info(
        `Socket ${socket.id} entrou na sala "${roomName}" como "${safeNickname}"`
      );

      const msg: ChatMessage = {
        id: randomUUID(),
        author: "Sistema",
        text: `${safeNickname} entrou na sala.`,
        time: new Date().toLocaleTimeString(),
      };

      socket.to(roomName).emit("system-message", msg);
    });

    socket.on("chat-message", ({ text }) => {
      const room = socket.data.room || DEFAULT_ROOM;
      const nickname = socket.data.nickname || "Anônimo";
      const trimmed = text.trim();
      if (!trimmed) return;

      const message: ChatMessage = {
        id: randomUUID(),
        author: nickname,
        text: trimmed,
        time: new Date().toLocaleTimeString(),
      };

      io.to(room).emit("chat-message", message);

      socket.emit("message-ack", {
        id: message.id,
        status: "delivered",
      });

      fastify.log.info(
        `Mensagem de "${nickname}" na sala "${room}": ${trimmed}`
      );
    });

    socket.on("typing", ({ isTyping }) => {
      const room = socket.data.room;
      const nickname = socket.data.nickname || "Alguém";
      if (!room) return;

      socket.to(room).emit("typing", { nickname, isTyping });
    });

    socket.on("disconnect", (reason) => {
      const nickname = socket.data.nickname;
      const room = socket.data.room;

      fastify.log.info(
        `Socket ${socket.id} (${nickname ?? "desconhecido"}) desconectou: ${reason}`
      );

      if (nickname && room) {
        const msg: ChatMessage = {
          id: randomUUID(),
          author: "Sistema",
          text: `${nickname} saiu da sala.`,
          time: new Date().toLocaleTimeString(),
        };

        socket.to(room).emit("system-message", msg);
      }
    });
  });

  return io;
}