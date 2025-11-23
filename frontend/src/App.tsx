import { useState } from "react";
import { NicknameInput } from "./components/NicknameInput";
import { Chat } from "./components/Chat";

function App() {
  const [nickname, setNickname] = useState<string | null>(null);

  const handleJoin = (name: string) => {
    setNickname(name);
  };

  const handleDisconnect = () => {
    setNickname(null);
  };

  return (
    <>
      {!nickname ? (
        <NicknameInput onJoin={handleJoin} />
      ) : (
        <Chat nickname={nickname} onDisconnect={handleDisconnect} />
      )}
    </>
  );
}

export default App;
