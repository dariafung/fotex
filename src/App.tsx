import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog"; // 引入系统文件夹选择弹窗

// --- 定义文件树数据接口 ---
interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  children: FileNode[];
}

// --- 递归渲染文件树的组件 ---
const TreeNode = ({ node }: { node: FileNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginLeft: "12px", fontSize: "14px", lineHeight: "1.6" }}>
      <div
        onClick={() => node.is_dir && setIsOpen(!isOpen)}
        style={{ cursor: node.is_dir ? "pointer" : "default", display: "flex", alignItems: "center", padding: "2px 0" }}
      >
        <span style={{ marginRight: "6px", fontSize: "16px" }}>
          {node.is_dir ? (isOpen ? "📂" : "📁") : (node.name.endsWith('.pdf') ? "📕" : "📄")}
        </span>
        <span style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: node.name.endsWith('.tex') ? "#007bff" : "#333"
        }}>
          {node.name}
        </span>
      </div>
      {/* 如果是文件夹且处于打开状态，递归渲染子节点 */}
      {node.is_dir && isOpen && node.children.map((child, idx) => (
        <TreeNode key={idx} node={child} />
      ))}
    </div>
  );
};

function App() {
  const [status, setStatus] = useState("等待编译...");
  const [texContent, setTexContent] = useState(""); // 初始置空，等待 read_tex 读取
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 新增：工作目录与文件树状态
  const [workDir, setWorkDir] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode | null>(null);

  // 1. 初始化读取默认 tex (利用生命周期钩子)
  useEffect(() => {
    const loadInitialTex = async () => {
      try {
        const content = await invoke<string>("read_tex");
        setTexContent(content);
      } catch (err) {
        console.error("读取初始文件失败:", err);
      }
    };
    loadInitialTex();
  }, []);

  // 2. 打开文件夹并读取文件树
  const handleOpenFolder = async () => {
    try {
      const selectedPath = await open({
        directory: true, // 选择文件夹
        multiple: false,
      });

      if (selectedPath && typeof selectedPath === 'string') {
        setWorkDir(selectedPath);
        refreshFolder(selectedPath);
      }
    } catch (err) {
      console.error("无法打开文件夹", err);
    }
  };

  // 3. 刷新左侧文件树
  const refreshFolder = async (path: string) => {
    try {
      const tree = await invoke<FileNode>("read_folder", { path });
      setFileTree(tree);
    } catch (err) {
      console.error("读取目录失败", err);
    }
  };

  // 4. 修改后的编译函数，传入 workDir
  const handleCompile = async () => {
    try {
      setStatus("编译中...");
      const result = await invoke<string>("compile_latex", {
        content: texContent,
        workDir: workDir // Tauri 会自动将 JS 的 camelCase 映射为 Rust 的 snake_case (work_dir)
      });
      setStatus(`✅ PDF 路径: ${result}`);

      // 编译完成后刷新左侧树状图，显示新生成的 pdf
      if (workDir) refreshFolder(workDir);
    } catch (err) {
      console.error(err);
      setStatus(`❌ 编译错误: ${err}`);
    }
  };

  // 5. AI 修改代码 (保持原有逻辑不变)
  const handleAiEdit = async () => {
    if (!aiPrompt.trim()) return;

    try {
      setIsAiLoading(true);
      setStatus("AI 正在思考中...");

      const fullPrompt = `你是一个 LaTeX 专家。请根据以下要求修改 LaTeX 代码，
      仅输出修改后的完整代码，不要包含任何解释文字或 Markdown 代码块标识符。
      
      当前代码：
      ${texContent}
      
      修改要求：
      ${aiPrompt}`;

      const newContent = await invoke<string>("ask_ollama", { prompt: fullPrompt });

      // 简单清洗一下 AI 可能返回的 Markdown 标记
      const cleanedContent = newContent.replace(/^```latex\n?/m, '').replace(/```$/m, '').trim();

      setTexContent(cleanedContent);
      setAiPrompt("");
      setStatus("✨ AI 修改完成！");
    } catch (err) {
      console.error(err);
      setStatus(`❌ AI 错误: ${err}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif", overflow: "hidden" }}>

      {/* 左侧：文件管理器侧边栏 */}
      <aside style={{
        width: "280px",
        backgroundColor: "#f7f7f9",
        borderRight: "1px solid #e1e1e1",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ padding: "15px", borderBottom: "1px solid #e1e1e1" }}>
          <button
            onClick={handleOpenFolder}
            style={{ width: "100%", padding: "10px", backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            📁 打开工作目录
          </button>
          {workDir && (
            <div style={{ fontSize: "12px", color: "#666", marginTop: "10px", wordBreak: "break-all" }}>
              <strong>当前目录:</strong><br />{workDir}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          {fileTree ? <TreeNode node={fileTree} /> : <div style={{ color: "#999", textAlign: "center", marginTop: "20px" }}>尚未选择文件夹</div>}
        </div>
      </aside>

      {/* 右侧：主编辑器与 AI 控制区 */}
      <main style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", backgroundColor: "#fff", overflowY: "auto" }}>
        <h2 style={{ marginTop: 0, marginBottom: "15px" }}>Latex Local AI Editor</h2>

        <textarea
          style={{
            flex: 1,
            width: "100%",
            fontFamily: "monospace",
            marginBottom: "15px",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
            resize: "none",
            backgroundColor: "#fafafa"
          }}
          value={texContent}
          onChange={(e) => setTexContent(e.target.value)}
        />

        {/* AI 对话框区域 */}
        <div style={{
          backgroundColor: "#f0f4f8",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "15px",
          border: "1px solid #dce4ec"
        }}>
          <h4 style={{ marginTop: 0, marginBottom: "10px", color: "#334155" }}>✨ AI 助手 (Ollama)</h4>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="例如：帮我把标题改成'我的论文'，并添加一个表格..."
              style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiEdit()}
            />
            <button
              onClick={handleAiEdit}
              disabled={isAiLoading}
              style={{
                padding: "10px 20px",
                backgroundColor: isAiLoading ? "#94a3b8" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isAiLoading ? "not-allowed" : "pointer",
                fontWeight: "bold"
              }}
            >
              {isAiLoading ? "思考中..." : "执行修改"}
            </button>
          </div>
        </div>

        {/* 底部控制栏 */}
        <div style={{ display: "flex", gap: "15px", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "15px" }}>
          <button
            onClick={handleCompile}
            style={{
              padding: "12px 24px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
            }}
          >
            🚀 编译生成 PDF
          </button>
          <span style={{ color: "#475569", fontSize: "14px" }}>状态: <strong>{status}</strong></span>
        </div>
      </main>

    </div>
  );
}

export default App;