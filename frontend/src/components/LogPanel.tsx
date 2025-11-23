import { useEffect, useRef } from "react";
import "./LogPanel.css";

interface LogPanelProps {
  logs: string[];
  visible?: boolean; // controls visibility (mobile toggle)
  overlay?: boolean; // overlay style when expanded on mobile
}

export function LogPanel({
  logs,
  visible = true,
  overlay = false,
}: LogPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const classNames = [
    "log-panel",
    !visible ? "collapsed" : "",
    overlay ? "overlay" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={classNames} aria-hidden={!visible}>
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
