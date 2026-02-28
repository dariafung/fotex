import { useProjectStore } from "../../state/useProjectStore";

export function PromptButtons() {
  const ollamaReady = useProjectStore((s) => s.ollamaReady);
  const promptFormula = useProjectStore((s) => s.promptFormula);
  const promptFixError = useProjectStore((s) => s.promptFixError);
  const promptComplete = useProjectStore((s) => s.promptComplete);
  const assistantStatus = useProjectStore((s) => s.assistantStatus);
  const disabled = !ollamaReady || assistantStatus === "thinking";

  return (
    <div className="prompt-buttons">
      <button
        type="button"
        disabled={disabled}
        onClick={promptFormula}
        title="Convert selected text to LaTeX formula"
      >
        To formula
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={promptFixError}
        title="Fix compile error from log"
      >
        Fix error
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={promptComplete}
        title="Complete paragraph at cursor"
      >
        Complete paragraph
      </button>
    </div>
  );
}
