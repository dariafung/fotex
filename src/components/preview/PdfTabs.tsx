import { useState } from "react";
import { useProjectStore } from "../../state/useProjectStore";
import { PdfPreview } from "./PdfPreview";

export function PdfTabs() {
  const [logOpen, setLogOpen] = useState(false);
  const activePdfTab = useProjectStore((s) => s.activePdfTab);
  const setActivePdfTab = useProjectStore((s) => s.setActivePdfTab);
  const compiledPdfPath = useProjectStore((s) => s.compiledPdfPath);
  const uploadedPdfPath = useProjectStore((s) => s.uploadedPdfPath);
  const compileLog = useProjectStore((s) => s.compileLog);
  const compileStatus = useProjectStore((s) => s.compileStatus);

  const currentPath = activePdfTab === "compiled" ? compiledPdfPath : uploadedPdfPath;

  return (
    <div className="pdf-tabs">
      <div className="pdf-tabs-header">
        <button
          type="button"
          className={`pdf-tab ${activePdfTab === "compiled" ? "pdf-tab--active" : ""}`}
          onClick={() => setActivePdfTab("compiled")}
        >
          Compiled PDF
        </button>
        <button
          type="button"
          className={`pdf-tab ${activePdfTab === "uploaded" ? "pdf-tab--active" : ""}`}
          onClick={() => setActivePdfTab("uploaded")}
        >
          Uploaded PDF
        </button>
        <button
          type="button"
          className={`pdf-log-toggle ${logOpen ? "pdf-log-toggle--open" : ""}`}
          onClick={() => setLogOpen((o) => !o)}
          title="Compile log"
        >
          Log {compileStatus === "error" && "(error)"}
        </button>
      </div>
      <div className="pdf-tabs-body">
        <PdfPreview pdfPath={currentPath} />
      </div>
      {logOpen && (
        <div className="pdf-log-panel">
          <pre className="pdf-log-content">{compileLog || "No log yet."}</pre>
        </div>
      )}
    </div>
  );
}
