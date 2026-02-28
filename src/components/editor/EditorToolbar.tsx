import { useProjectStore } from "../../state/useProjectStore";

interface EditorToolbarProps {
  onToggleAssistant: () => void;
  assistantOpen: boolean;
}

export function EditorToolbar({ onToggleAssistant, assistantOpen }: EditorToolbarProps) {
  const texPath = useProjectStore((s) => s.texPath);
  const dirty = useProjectStore((s) => s.dirty);
  const compileStatus = useProjectStore((s) => s.compileStatus);
  const openFile = useProjectStore((s) => s.openFile);
  const saveFile = useProjectStore((s) => s.saveFile);
  const compile = useProjectStore((s) => s.compile);
  const uploadPdf = useProjectStore((s) => s.uploadPdf);

  const fileName = texPath ? texPath.replace(/^.*[\\/]/, "") : "Untitled";

  return (
    <div className="editor-toolbar">
      <div className="editor-toolbar-left">
        <button type="button" onClick={openFile} title="Open .tex file">
          Open
        </button>
        <button type="button" onClick={saveFile} title="Save">
          Save
        </button>
        <button type="button" onClick={compile} title="Compile LaTeX">
          Compile
        </button>
        <button type="button" onClick={uploadPdf} title="Upload PDF to workspace">
          Upload PDF
        </button>
      </div>
      <div className="editor-toolbar-center">
        <span className="editor-filename">{fileName}</span>
        {dirty && <span className="editor-dirty">•</span>}
        <span
          className={`editor-compile-status editor-compile-status--${compileStatus}`}
          title={compileStatus}
        >
          {compileStatus === "compiling" && "…"}
          {compileStatus === "success" && "✓"}
          {compileStatus === "error" && "✗"}
          {compileStatus === "idle" && ""}
        </span>
      </div>
      <div className="editor-toolbar-right">
        <button
          type="button"
          onClick={onToggleAssistant}
          title={assistantOpen ? "Hide assistant" : "Show assistant"}
        >
          {assistantOpen ? "Hide AI" : "Show AI"}
        </button>
      </div>
    </div>
  );
}
