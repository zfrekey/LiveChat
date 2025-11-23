import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <p>LiveChat</p>
        <p>count is {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    </>
  );
}

export default App;
