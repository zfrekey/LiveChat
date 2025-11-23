import { io, type Socket } from "socket.io-client";

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface ServerToClientEvents {
  "system-message": (msg: ChatMessage) => void;
  "chat-message": (msg: ChatMessage) => void;
  "message-ack": (data: { id: string; status: "delivered" }) => void;
  typing: (data: { nickname: string; isTyping: boolean }) => void;
  "connection-info": (data: { ip: string }) => void;
}

export interface ClientToServerEvents {
  join: (data: { nickname: string; room?: string }) => void;
  "chat-message": (data: { text: string }) => void;
  typing: (data: { isTyping: boolean }) => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

function createSocket(): TypedSocket {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const s: TypedSocket = io(baseUrl, {
    autoConnect: false,
  });

  s.on("connect", () => console.log("[socket] conectado:", s.id));
  s.on("system-message", (msg) => console.log("[socket] system-message:", msg));
  s.on("chat-message", (msg) => console.log("[socket] chat-message:", msg));
  s.on("message-ack", (data) => console.log("[socket] message-ack:", data));
  s.on("typing", (data) => console.log("[socket] typing:", data));
  s.on("connection-info", (data) =>
    console.log("[socket] connection-info:", data)
  );
  s.on("connect_error", (err) =>
    console.warn("[socket] connect_error:", err?.message ?? err)
  );
  s.on("disconnect", (reason) => console.log("[socket] disconnect:", reason));

  return s;
}

export function getSocket(): TypedSocket {
  if (!socket) {
    socket = createSocket();
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
