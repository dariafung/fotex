import { useState, useEffect } from "react"; // 👇 1. 引入 useEffect
import { useProjectStore } from "../../state/useProjectStore";

export function AssistantPanel() {
  const [input, setInput] = useState("");
  
  const ollamaModel = useProjectStore((s) => s.ollamaModel);
  const ollamaModels = useProjectStore((s) => s.ollamaModels);
  const setOllamaModel = useProjectStore((s) => s.setOllamaModel);
  const rewriteEditorContent = useProjectStore((s) => s.rewriteEditorContent);
  
  // 👇 2. 从 store 中把 loadModels 拿出来
  const loadModels = useProjectStore((s) => s.loadModels); 

  const ollamaReady = useProjectStore((s) => s.ollamaReady);
  const assistantStatus = useProjectStore((s) => s.assistantStatus);
  const assistantError = useProjectStore((s) => s.assistantError);

  // 👇 3. 组件加载时，调用 Tauri 后端去获取模型列表
  useEffect(() => {
    loadModels();
    // 可选：如果你希望它每隔一段时间自动刷新一下列表，可以加个定时器
    // const interval = setInterval(loadModels, 10000);
    // return () => clearInterval(interval);
  }, [loadModels]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    rewriteEditorContent(text); 
    // 👆 这里调用的 rewriteEditorContent 内部会自动读取最新的 ollamaModel，切换完全生效！
  };

  return (
    <div className="assistant-panel">
      <div className="assistant-panel-header">
        <span className="assistant-title">AI Editor Assistant ✨</span>
        {!ollamaReady && (
          <span className="assistant-status assistant-status--error">Ollama not running</span>
        )}
        {ollamaReady && (
          <span className="assistant-status-ready">
            <span className="assistant-status-dot" aria-hidden />
            Ollama Ready
          </span>
        )}
        {ollamaReady && (
          <select
            className="assistant-model-select"
            value={ollamaModel}
            onChange={(e) => setOllamaModel(e.target.value)}
            style={{ 
              backgroundColor: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155", 
              borderRadius: "4px",
              padding: "2px 6px",
              outline: "none",
              colorScheme: "dark",
              maxWidth: "180px" // 防止模型名字过长
            }}
          >
            {/* 如果正在加载或者没有模型 */}
            {ollamaModels.length === 0 && (
              <option value={ollamaModel} style={{ backgroundColor: "#1e293b", color: "#f1f5f9" }}>
                {ollamaModel || "Loading..."}
              </option>
            )}
            {/* 映射后端返回的模型列表 */}
            {ollamaModels.map((m) => (
              <option key={m} value={m} style={{ backgroundColor: "#1e293b", color: "#f1f5f9" }}>
                {m}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="assistant-composer">
        {assistantError && (
          <div className="assistant-error">{assistantError}</div>
        )}
        <div className="assistant-input-row">
          <textarea
            className="assistant-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tell AI how do you want to change this file..."
            rows={2}
            disabled={!ollamaReady || assistantStatus === "thinking"}
          />
          <button
            type="button"
            className="assistant-send"
            onClick={handleSend}
            disabled={!ollamaReady || assistantStatus === "thinking" || !input.trim()}
            title={assistantStatus === "thinking" ? "Thinking..." : "Send"}
          >
            <span aria-hidden>{assistantStatus === "thinking" ? "⏳" : "✨"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}