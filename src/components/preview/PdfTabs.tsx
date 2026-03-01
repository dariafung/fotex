import { useState } from "react";
import { useProjectStore } from "../../state/useProjectStore";
import { PdfPreview } from "./PdfPreview";

export function PdfTabs() {
  const [logOpen, setLogOpen] = useState(false);
  const activePdfTab = useProjectStore((s) => s.activePdfTab);
  const setActivePdfTab = useProjectStore((s) => s.setActivePdfTab);
  const compiledPdfPath = useProjectStore((s) => s.compiledPdfPath);
  const compiledAt = useProjectStore((s) => s.compiledAt);
  const uploadedPdfPath = useProjectStore((s) => s.uploadedPdfPath);
  const compileLog = useProjectStore((s) => s.compileLog);
  const compileStatus = useProjectStore((s) => s.compileStatus);

  const ollamaReady = useProjectStore((s) => s.ollamaReady);
  const assistantStatus = useProjectStore((s) => s.assistantStatus);
  const rewriteEditorContent = useProjectStore((s) => s.rewriteEditorContent);

  const currentPath = activePdfTab === "compiled" ? compiledPdfPath : uploadedPdfPath;
  const refreshKey = activePdfTab === "compiled" ? compiledAt : undefined;

  const handleFixError = () => {
    if (!compileLog) return;
    
    const prompt = `The LaTeX compilation failed with the following log:\n${compileLog}\n\nPlease fix the errors in my LaTeX code.`;
    rewriteEditorContent(prompt);
  };

  return (
    <div className="pdf-tabs">
      <div className="pdf-tabs-header">
        <button
          type="button"
          className={`pdf-tab ${activePdfTab === "compiled" && !logOpen ? "pdf-tab--active" : ""}`}
          onClick={() => { setActivePdfTab("compiled"); setLogOpen(false); }}
        >
          Preview
        </button>
        <button
          type="button"
          className={`pdf-tab ${logOpen ? "pdf-tab--active" : ""}`}
          onClick={() => setLogOpen(true)}
          title="Compile log"
        >
          Logs
        </button>
        {activePdfTab === "uploaded" && (
          <button
            type="button"
            className={`pdf-tab ${activePdfTab === "uploaded" ? "pdf-tab--active" : ""}`}
            onClick={() => { setActivePdfTab("uploaded"); setLogOpen(false); }}
          >
            Uploaded
          </button>
        )}
      </div>
      <div className="pdf-tabs-body">
        {logOpen ? (
          <div className="pdf-log-panel pdf-log-panel--full" style={{ display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ 
              paddingBottom: '10px', 
              marginBottom: '10px', 
              borderBottom: '1px solid #334155', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                {compileStatus === "error" ? "⚠️ Compilation failed" : "Compilation Log"}
              </span>
              
              <button
                type="button"
                className="pdf-preview__open-btn"
                onClick={handleFixError}
                disabled={!ollamaReady || assistantStatus === "thinking" || !compileLog || compileStatus === "success"}
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '13px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  opacity: (!ollamaReady || assistantStatus === "thinking" || !compileLog || compileStatus === "success") ? 0.5 : 1
                }}
              >
                {assistantStatus === "thinking" ? "⏳ Fixing..." : "✨ Fix error with AI"}
              </button>
            </div>

            <pre className="pdf-log-content" style={{ flex: 1, overflow: 'auto', margin: 0 }}>
              {compileLog || "No log yet."}
            </pre>
          </div>
        ) : (
          <PdfPreview pdfPath={currentPath} refreshKey={refreshKey} />
        )}
      </div>
    </div>
  );
}