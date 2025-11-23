import { useEffect, useState } from "react";
import { getSocket, connectSocket, disconnectSocket } from "../lib/socket";
import type { ChatMessage } from "../lib/socket";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import "./Chat.css";

interface ChatProps {
  nickname: string;
  onDisconnect: () => void;
}

export function Chat({ nickname, onDisconnect }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string>("");

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socket.id || "");
      socket.emit("join", { nickname });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setSocketId("");
    };

    const handleSystemMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleChatMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleTyping = ({
      nickname: typingNickname,
      isTyping,
    }: {
      nickname: string;
      isTyping: boolean;
    }) => {
      if (isTyping) {
        setTypingUser(typingNickname);
      } else {
        setTypingUser((prev) => (prev === typingNickname ? null : prev));
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("system-message", handleSystemMessage);
    socket.on("chat-message", handleChatMessage);
    socket.on("typing", handleTyping);

    connectSocket();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("system-message", handleSystemMessage);
      socket.off("chat-message", handleChatMessage);
      socket.off("typing", handleTyping);
      disconnectSocket();
    };
  }, [nickname]);

  const handleSendMessage = (text: string) => {
    const socket = getSocket();
    socket.emit("chat-message", { text });
  };

  const handleTyping = (isTyping: boolean) => {
    const socket = getSocket();
    socket.emit("typing", { isTyping });
  };

  const handleDisconnectClick = () => {
    disconnectSocket();
    onDisconnect();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">Socket Chat</div>
        <div className="chat-status">
          <span
            className={`status-indicator ${
              isConnected ? "connected" : "disconnected"
            }`}
          ></span>
          <span className="status-text">
            {isConnected ? `Conectado a: ${nickname}` : "Desconectado"}
          </span>
          {socketId && <span className="socket-id">({socketId})</span>}
        </div>
        <button className="disconnect-button" onClick={handleDisconnectClick}>
          Sair
        </button>
      </div>
      <MessageList
        messages={messages}
        currentUser={nickname}
        typingUser={typingUser}
      />
      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
}
