import { useState, useEffect } from "react";
import { useProjectStore } from "../../state/useProjectStore";

export function AssistantPanel() {
  const [input, setInput] = useState("");
  
  // 1. 引入所有的 Ollama 状态
  const ollamaUrl = useProjectStore((s) => s.ollamaUrl);
  const setOllamaUrl = useProjectStore((s) => s.setOllamaUrl);
  const ollamaModel = useProjectStore((s) => s.ollamaModel);
  const ollamaModels = useProjectStore((s) => s.ollamaModels);
  const setOllamaModel = useProjectStore((s) => s.setOllamaModel);
  const loadModels = useProjectStore((s) => s.loadModels); 
  const rewriteEditorContent = useProjectStore((s) => s.rewriteEditorContent);
  const ollamaReady = useProjectStore((s) => s.ollamaReady);
  const assistantStatus = useProjectStore((s) => s.assistantStatus);
  const assistantError = useProjectStore((s) => s.assistantError);

  // 2. 组件加载时，尝试用默认的 Url 拉取模型
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    rewriteEditorContent(text); 
  };

  return (
    <div className="assistant-panel" style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px" }}>
      
      {/* 头部：标题与状态 */}
      <div className="assistant-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="assistant-title" style={{ fontWeight: "bold" }}>AI Editor Assistant ✨</span>
        {!ollamaReady ? (
          <span className="assistant-status assistant-status--error" style={{ color: "#ef4444", fontSize: "0.85rem" }}>
            Ollama disconnected
          </span>
        ) : (
          <span className="assistant-status-ready" style={{ color: "#22c55e", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
            <span className="assistant-status-dot" style={{ width: "8px", height: "8px", backgroundColor: "#22c55e", borderRadius: "50%" }} aria-hidden />
            Ollama Ready
          </span>
        )}
      </div>

      {/* ✨ 新增：Ollama 网络配置区 */}
      <div className="assistant-config-row" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          value={ollamaUrl}
          onChange={(e) => setOllamaUrl(e.target.value)}
          placeholder="http://localhost:11434"
          style={{
            flex: 1,
            backgroundColor: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid #334155",
            borderRadius: "4px",
            padding: "4px 8px",
            fontSize: "0.85rem",
            outline: "none"
          }}
        />
        <button
          onClick={loadModels}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "4px 10px",
            fontSize: "0.85rem",
            cursor: "pointer"
          }}
          title="Connect to Ollama and refresh models"
        >
          Connect
        </button>
        
        {/* 模型选择下拉框 */}
        {ollamaModels.length > 0 && (
          <select
            className="assistant-model-select"
            value={ollamaModel}
            onChange={(e) => setOllamaModel(e.target.value)}
            style={{ 
              backgroundColor: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155", 
              borderRadius: "4px",
              padding: "4px 6px",
              outline: "none",
              colorScheme: "dark",
              maxWidth: "140px",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            {ollamaModels.map((m) => (
              <option key={m} value={m} style={{ backgroundColor: "#1e293b", color: "#f1f5f9" }}>
                {m}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 对话输入区 */}
      <div className="assistant-composer">
        {assistantError && (
          <div className="assistant-error" style={{ color: "#ef4444", marginBottom: "8px", fontSize: "0.85rem" }}>
            {assistantError}
          </div>
        )}
        <div className="assistant-input-row" style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
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
            style={{
              flex: 1,
              backgroundColor: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155",
              borderRadius: "4px",
              padding: "8px",
              outline: "none",
              resize: "none"
            }}
          />
          <button
            type="button"
            className="assistant-send"
            onClick={handleSend}
            disabled={!ollamaReady || assistantStatus === "thinking" || !input.trim()}
            title={assistantStatus === "thinking" ? "Thinking..." : "Send"}
            style={{
              backgroundColor: (!ollamaReady || !input.trim() || assistantStatus === "thinking") ? "#475569" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px 12px",
              cursor: (!ollamaReady || !input.trim() || assistantStatus === "thinking") ? "not-allowed" : "pointer"
            }}
          >
            <span aria-hidden>{assistantStatus === "thinking" ? "⏳" : "✨"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}