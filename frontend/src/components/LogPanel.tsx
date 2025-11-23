import { useEffect, useRef } from "react";
import "./LogPanel.css";

interface LogPanelProps {
  logs: string[];
}

export function LogPanel({ logs }: LogPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <aside className="log-panel">
      <h2 className="log-title">Log</h2>
      <div className="log-lines">
        {logs.map((l, i) => (
          <div key={i} className="log-line">
            {l}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </aside>
  );
}
