import { useEffect, useState, useRef } from "react";
import { getSocket, connectSocket, disconnectSocket } from "../lib/socket";
import type { ChatMessage } from "../lib/socket";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

import "./Chat.css";
import { LogPanel } from "./LogPanel";

interface ChatProps {
  nickname: string;
  onDisconnect: () => void;
}

export function Chat({ nickname, onDisconnect }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string>("");
  const [clientIp, setClientIp] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const typingStateRef = useRef<Record<string, boolean>>({});

  const pushLog = (line: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${ts}] ${line}`]);
  };

  useEffect(() => {
    const socket = getSocket();

    // Disparar log inicial de forma assíncrona para evitar render extra
    queueMicrotask(() =>
      pushLog("INFO: Starting client... Attempting connection")
    );

    const handleConnect = () => {
      setIsConnected(true);
      setSocketId(socket.id || "");
      pushLog(`SUCCESS: Connected as ${nickname} (${socket.id})`);
      socket.emit("join", { nickname });
      pushLog(`INFO: Emitted join with nickname='${nickname}'`);
    };

    const handleDisconnect = (reason?: string) => {
      setIsConnected(false);
      setSocketId("");
      pushLog(`INFO: Disconnected${reason ? ` (${reason})` : ""}`);
    };

    const handleSystemMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      pushLog(`SYSTEM: ${msg.text}`);
    };

    const handleChatMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      const origin = msg.author === nickname ? "Local" : `Remote:${msg.author}`;
      pushLog(
        `MESSAGE RX (${origin}) id=${msg.id} text='${msg.text}' (${msg.text.length} bytes)`
      );
    };

    const handleTyping = ({
      nickname: typingNickname,
      isTyping,
    }: {
      nickname: string;
      isTyping: boolean;
    }) => {
      const prevState = typingStateRef.current[typingNickname] || false;
      if (isTyping && !prevState) {
        // transição para digitando
        typingStateRef.current[typingNickname] = true;
        setTypingUser(typingNickname);
        pushLog(`INFO: ${typingNickname} started typing`);
      } else if (!isTyping && prevState) {
        // transição para parar
        typingStateRef.current[typingNickname] = false;
        setTypingUser((prev) => (prev === typingNickname ? null : prev));
        pushLog(`INFO: ${typingNickname} stopped typing`);
      }
      // demais eventos iguais são ignorados (evita flood)
    };

    const handleAck = (data: { id: string; status: "delivered" }) => {
      pushLog(`SUCCESS: ACK received for outgoing message id=${data.id}`);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("system-message", handleSystemMessage);
    socket.on("chat-message", handleChatMessage);
    socket.on("typing", handleTyping);
    socket.on("message-ack", handleAck);
    socket.on("connection-info", (data: { ip: string }) => {
      setClientIp(data.ip);
      pushLog(`INFO: Connection info received IP=${data.ip}`);
    });

    connectSocket();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("system-message", handleSystemMessage);
      socket.off("chat-message", handleChatMessage);
      socket.off("typing", handleTyping);
      socket.off("message-ack", handleAck);
      socket.off("connection-info");
      disconnectSocket();
    };
  }, [nickname]);

  const handleSendMessage = (text: string) => {
    const socket = getSocket();
    socket.emit("chat-message", { text });
    pushLog(
      `INFO: Local user sending message id=pending text='${text}' (${text.length} bytes)`
    );
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
    <div className="chat-layout">
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
              {isConnected ? `Conectado: ${nickname}` : "Desconectado"}
            </span>
            {socketId && (
              <span className="socket-id">
                ({socketId}
                {clientIp ? ` · ${clientIp}` : ""})
              </span>
            )}
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
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </div>
      <LogPanel logs={logs} />
    </div>
  );
}
