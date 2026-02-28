import { useProjectStore } from "../../state/useProjectStore";

export function StatusBar() {
  const compileStatus = useProjectStore((s) => s.compileStatus);
  const ollamaReady = useProjectStore((s) => s.ollamaReady);
  const lastSavedAt = useProjectStore((s) => s.lastSavedAt);

  const statusText =
    compileStatus === "compiling"
      ? "Compiling…"
      : compileStatus === "success"
        ? "Compiled"
        : compileStatus === "error"
          ? "Compile failed"
          : "";
  const ollamaText = ollamaReady ? "Ollama ready" : "Ollama not running";
  const savedText = lastSavedAt
    ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
    : "";

  return (
    <footer className="status-bar">
      <span className="status-bar-left">{statusText}</span>
      <span className="status-bar-center">{savedText}</span>
      <span className={`status-bar-right ${ollamaReady ? "" : "status-bar-right--error"}`}>
        {ollamaText}
      </span>
    </footer>
  );
}
