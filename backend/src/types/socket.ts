import { Server as IOServer } from "socket.io";

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  time: string; // HH:mm ou ISO
}

export interface ClientToServerEvents {
  join: (data: { nickname: string; room?: string }) => void;
  "chat-message": (data: { text: string }) => void;
  typing: (data: { isTyping: boolean }) => void;
}

export interface ServerToClientEvents {
  "system-message": (msg: ChatMessage) => void;
  "chat-message": (msg: ChatMessage) => void;
  "message-ack": (data: { id: string; status: "delivered" }) => void;
  typing: (data: { nickname: string; isTyping: boolean }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  nickname?: string;
  room?: string;
}

export type TypedIOServer = IOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;