import { useState } from "react";
import { invoke } from "@tauri-apps/api/core"; // 如果你用的是 Tauri v1, 改为 "@tauri-apps/api/tauri"

function App() {
  const [status, setStatus] = useState("等待编译...");
  const [texContent, setTexContent] = useState(
    "\\documentclass{article}\n\\begin{document}\nHello Tauri + LaTeX!\n\\end{document}"
  );

  const handleCompile = async () => {
    try {
      setStatus("编译中...");
      // 调用 Rust 后端的 compile_latex 命令
      const result = await invoke<string>("compile_latex", { content: texContent });
      setStatus(`✅ ${result}`);
    } catch (err) {
      console.error(err);
      setStatus(`❌ 错误: ${err}`);
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Latex Local AI Editor</h1>
      
      <textarea
        style={{
          width: "100%",
          height: "200px",
          fontFamily: "monospace",
          marginBottom: "1rem",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
        value={texContent}
        onChange={(e) => setTexContent(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button 
          onClick={handleCompile}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          运行编译测试
        </button>
        <span>状态: <strong>{status}</strong></span>
      </div>
    </main>
  );
}

// 必须要有这一行，否则前端就是空白！
export default App;