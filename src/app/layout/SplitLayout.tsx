import { useState } from "react";
import { LatexEditor } from "../../components/editor/LatexEditor";
import { EditorToolbar } from "../../components/editor/EditorToolbar";
import { PdfTabs } from "../../components/preview/PdfTabs";
import { AssistantPanel } from "../../components/assistant/AssistantPanel";
import { StatusBar } from "../../components/common/StatusBar";
import { Toast } from "../../components/common/Toast";
import "../../App.css";

export function SplitLayout() {
  const [assistantOpen, setAssistantOpen] = useState(true);

  return (
    <div className="split-layout">
      <div className="split-main">
        <div className="split-editor">
          <EditorToolbar
            onToggleAssistant={() => setAssistantOpen((o) => !o)}
            assistantOpen={assistantOpen}
          />
          <LatexEditor />
        </div>
        <div className="split-preview">
          <PdfTabs />
        </div>
      </div>
      {assistantOpen && (
        <aside className="split-assistant">
          <AssistantPanel />
        </aside>
      )}
      <StatusBar />
      <Toast />
    </div>
  );
}
