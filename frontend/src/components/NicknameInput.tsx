import { useState } from "react";
import "./NicknameInput.css";

interface NicknameInputProps {
  onJoin: (nickname: string) => void;
}

export function NicknameInput({ onJoin }: NicknameInputProps) {
  const [nickname, setNickname] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed) {
      onJoin(trimmed);
    }
  };

  return (
    <div className="nickname-container">
      <div className="nickname-card">
        <h1>Socket Chat</h1>
        <p>Digite seu nome para entrar</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Seu nome..."
            maxLength={20}
            autoFocus
          />
          <button type="submit" disabled={!nickname.trim()}>
            Entrar no Chat
          </button>
        </form>
      </div>
    </div>
  );
}
