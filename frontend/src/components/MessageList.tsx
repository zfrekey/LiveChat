import { useEffect, useRef } from "react";
import type { ChatMessage } from "../lib/socket";
import "./MessageList.css";

interface MessageListProps {
  messages: ChatMessage[];
  currentUser: string;
  typingUser: string | null;
}

export function MessageList({
  messages,
  currentUser,
  typingUser,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  return (
    <div className="message-list">
      {messages.map((msg) => {
        const isOwnMessage = msg.author === currentUser;
        const isSystemMessage = msg.author === "Sistema";

        if (isSystemMessage) {
          return (
            <div key={msg.id} className="message-system">
              {msg.text}
            </div>
          );
        }

        return (
          <div
            key={msg.id}
            className={`message ${
              isOwnMessage ? "message-own" : "message-other"
            }`}
          >
            {!isOwnMessage && (
              <div className="message-author">{msg.author}</div>
            )}
            <div className="message-bubble">
              <div className="message-text">{msg.text}</div>
              <div className="message-time">{msg.time}</div>
            </div>
          </div>
        );
      })}
      {typingUser && (
        <div className="typing-indicator">
          <span>{typingUser} está digitando</span>
          <span className="typing-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
