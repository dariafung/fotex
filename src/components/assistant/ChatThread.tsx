import { useRef, useEffect } from "react";
import { useProjectStore } from "../../state/useProjectStore";

export function ChatThread() {
  const messages = useProjectStore((s) => s.assistantMessages);
  const assistantStatus = useProjectStore((s) => s.assistantStatus);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-thread">
      {messages.length === 0 && (
        <div className="chat-thread-empty">Ask about LaTeX or use the buttons below.</div>
      )}
      {messages.map((m, i) => (
        <div key={i} className={`chat-message chat-message--${m.role}`}>
          <span className="chat-message-role">{m.role}</span>
          <pre className="chat-message-content">{m.content}</pre>
        </div>
      ))}
      {assistantStatus === "thinking" && (
        <div className="chat-message chat-message--assistant">
          <span className="chat-message-role">assistant</span>
          <span className="chat-message-content">…</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
