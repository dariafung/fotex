import { create } from "zustand";
import type {
  CompileStatus,
  ActivePdfTab,
  AssistantStatus,
  Message,
} from "./types";
import * as tauri from "../lib/tauri";
import {
  PROMPT_FORMULA,
  userPromptFormula,
  PROMPT_FIX_ERROR,
  userPromptFixError,
  PROMPT_COMPLETE,
  userPromptComplete,
} from "../lib/prompts";

const DEFAULT_TEX = `\\documentclass{article}
\\begin{document}
Hello, LaTeX.
\\end{document}
`;

// Helper to extract LaTeX from AI responses robustly
const extractLatex = (raw: string): string => {
  return raw
    // 1. Remove <think> blocks (fallback for frontend safety)
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    // 2. Try to extract content between ```latex and ```
    // This regex looks for code blocks anywhere in the text
    .replace(/[\s\S]*?```(?:latex|tex)?\n?([\s\S]*?)\n?```[\s\S]*/gi, "$1")
    // 3. Fallback: if no code blocks found, just strip fences from start/end
    .replace(/^```(?:latex|tex)?\n?/mi, '')
    .replace(/```$/m, '')
    .trim();
};

export interface ProjectState {
  workspaceDir: string | undefined;
  texPath: string | undefined;
  texContent: string;
  dirty: boolean;
  compileStatus: CompileStatus;
  compileLog: string;
  compiledPdfPath: string | undefined;
  compiledAt: number | undefined; 
  uploadedPdfPath: string | undefined;
  activePdfTab: ActivePdfTab;
  selectionText: string | undefined;
  cursorContext: string | undefined;
  lastSavedAt: number | undefined;
  ollamaModel: string;
  ollamaModels: string[];
  ollamaReady: boolean;
  assistantMessages: Message[];
  assistantStatus: AssistantStatus;
  assistantError: string | undefined;
  toastMessage: string | undefined;
  toastVariant: "info" | "error" | "success";
  pendingReplaceSelection: string | undefined;
  pendingInsertAtCursor: string | undefined;
}

export interface ProjectActions {
  setTexContent: (content: string) => void;
  setSelection: (text: string | undefined) => void;
  setCursorContext: (context: string | undefined) => void;
  setActivePdfTab: (tab: ActivePdfTab) => void;
  setOllamaModel: (model: string) => void;
  setToast: (message: string | undefined, variant?: "info" | "error" | "success") => void;
  rewriteEditorContent: (instruction: string) => Promise<void>;
  loadModels: () => Promise<void>;
  loadTempTex: () => Promise<void>;
  openFile: () => Promise<void>;
  saveFile: () => Promise<boolean>;
  compile: () => Promise<void>;
  uploadPdf: () => Promise<void>;
  sendChat: (content: string) => Promise<void>;
  promptFormula: () => Promise<void>;
  promptFixError: () => Promise<void>;
  promptComplete: () => Promise<void>;
  applyFormulaToEditor: (latex: string) => void;
  appendAtCursor: (latex: string) => void;
  clearPendingReplace: () => void;
  clearPendingInsert: () => void;
  clearAssistant: () => void;
}

type Store = ProjectState & ProjectActions;

export const useProjectStore = create<Store>((set, get) => ({
  workspaceDir: undefined,
  texPath: undefined,
  texContent: DEFAULT_TEX,
  dirty: false,
  compileStatus: "idle",
  compileLog: "",
  compiledPdfPath: undefined,
  compiledAt: undefined,
  uploadedPdfPath: undefined,
  activePdfTab: "compiled",
  selectionText: undefined,
  cursorContext: undefined,
  lastSavedAt: undefined,
  ollamaModel: "gemma3:12b",
  ollamaModels: [],
  ollamaReady: false,
  assistantMessages: [],
  assistantStatus: "idle",
  assistantError: undefined,
  toastMessage: undefined,
  toastVariant: "info",
  pendingReplaceSelection: undefined,
  pendingInsertAtCursor: undefined,

  setTexContent: (content) => set({ texContent: content, dirty: true }),
  setSelection: (text) => set({ selectionText: text }),
  setCursorContext: (context) => set({ cursorContext: context }),
  setActivePdfTab: (tab) => set({ activePdfTab: tab }),
  setOllamaModel: (model) => set({ ollamaModel: model }),
  setToast: (message, variant = "info") => set({ toastMessage: message, toastVariant: variant }),

  loadModels: async () => {
    try {
      const { models } = await tauri.ollamaListModels();
      set({ ollamaModels: models ?? [], ollamaReady: true, assistantError: undefined });
      if (models?.length && !models.includes(get().ollamaModel)) {
        set({ ollamaModel: models[0] });
      }
    } catch {
      set({ ollamaModels: [], ollamaReady: false, assistantError: "Ollama not running" });
    }
  },

  loadTempTex: async () => {
    try {
      const result = await tauri.readMainTex();
      set({
        texContent: result.content,
        dirty: false,
        ...(result.texPath && { texPath: result.texPath }),
        ...(result.workspaceDir && { workspaceDir: result.workspaceDir }),
        ...(result.texPath && result.workspaceDir && { activePdfTab: "compiled" }),
      });
      if (result.texPath && result.workspaceDir) await get().compile();
    } catch {
      set({ texContent: DEFAULT_TEX });
    }
  },

  openFile: async () => {
    try {
      const { path, name } = await tauri.pickFile({ filters: [{ name: "LaTeX", extensions: ["tex"] }] });
      const { content } = await tauri.readTextFile({ path });
      const workspaceDir = path.replace(/[\\/][^\\/]*$/, "");
      set({ texPath: path, workspaceDir: workspaceDir || undefined, texContent: content, dirty: false });
      get().setToast(`Opened ${name}`, "success");
    } catch (e) {
      get().setToast(String(e), "error");
    }
  },

  saveFile: async () => {
    const { texPath, texContent } = get();
    if (!texPath) {
      get().setToast("No file open.", "error");
      return false;
    }
    try {
      const { ok } = await tauri.writeTextFile({ path: texPath, content: texContent });
      if (ok) {
        set({ dirty: false, lastSavedAt: Date.now() });
        get().setToast("Saved", "success");
        return true;
      }
    } catch (e) {
      get().setToast(String(e), "error");
    }
    return false;
  },

  compile: async () => {
    const { texContent, workspaceDir, texPath } = get();
    set({ compileStatus: "compiling" });
    try {
      const result = await tauri.compileTex({ texPath, texContent, workdir: workspaceDir });
      set({
        compileStatus: result.success ? "success" : "error",
        compileLog: result.log,
        compiledPdfPath: result.pdfPath ?? get().compiledPdfPath,
        ...(result.success && { compiledAt: Date.now() }),
      });
      get().setToast(result.success ? "Compiled" : "Compile failed", result.success ? "success" : "error");
    } catch (e) {
      set({ compileStatus: "error", compileLog: String(e) });
      get().setToast(String(e), "error");
    }
  },

  uploadPdf: async () => {
    try {
      const { path } = await tauri.pickFile({ filters: [{ name: "PDF", extensions: ["pdf"] }] });
      const { dstPath } = await tauri.copyPdfToWorkspace({ srcPath: path });
      set({ uploadedPdfPath: dstPath, activePdfTab: "uploaded" });
      get().setToast("PDF added", "success");
    } catch (e) {
      get().setToast(String(e), "error");
    }
  },

  sendChat: async (content) => {
    const { ollamaModel, assistantMessages, ollamaReady } = get();
    if (!ollamaReady) return get().setToast("Ollama not running.", "error");
    const next: Message[] = [...assistantMessages, { role: "user", content }];
    set({ assistantMessages: next, assistantStatus: "thinking" });
    try {
      const { text } = await tauri.ollamaGenerate({
        model: ollamaModel,
        messages: next.map((m) => ({ role: m.role, content: m.content })),
      });
      set({ assistantMessages: [...next, { role: "assistant", content: text }], assistantStatus: "idle" });
    } catch (e) {
      set({ assistantStatus: "error", assistantError: String(e) });
    }
  },

  promptFormula: async () => {
    const { selectionText, ollamaReady, ollamaModel, assistantMessages } = get();
    if (!selectionText?.trim() || !ollamaReady) return;
    set({ assistantStatus: "thinking" });
    try {
      const { text } = await tauri.ollamaGenerate({
        model: ollamaModel,
        messages: [
          { role: "system", content: PROMPT_FORMULA },
          { role: "user", content: userPromptFormula(selectionText) }
        ],
      });
      const latex = extractLatex(text);
      set({
        assistantStatus: "idle",
        assistantMessages: [...assistantMessages, { role: "user", content: `To formula: ${selectionText}` }, { role: "assistant", content: latex }],
      });
      get().applyFormulaToEditor(latex);
    } catch (e) {
      set({ assistantStatus: "error", assistantError: String(e) });
    }
  },

  promptFixError: async () => {
    const { compileLog, texContent, ollamaReady, ollamaModel, assistantMessages } = get();
    if (!compileLog?.trim() || !ollamaReady) return;
    set({ assistantStatus: "thinking" });
    try {
      const { text } = await tauri.ollamaGenerate({
        model: ollamaModel,
        messages: [
          { role: "system", content: PROMPT_FIX_ERROR },
          { role: "user", content: userPromptFixError(compileLog, texContent) }
        ],
      });

      // Robust extraction
      const fixedContent = extractLatex(text);

      set({
        assistantStatus: "idle",
        assistantMessages: [
          ...assistantMessages,
          { role: "user", content: "Fix error" },
          { role: "assistant", content: "I've applied a fix to your document. ✨" },
        ],
      });

      // Update the editor!
      get().setTexContent(fixedContent);
      get().setToast("AI Fix Applied!", "success");
    } catch (e) {
      set({ assistantStatus: "error", assistantError: String(e) });
      get().setToast("Fix failed.", "error");
    }
  },

  promptComplete: async () => {
    const { cursorContext, ollamaReady, ollamaModel, assistantMessages } = get();
    if (!cursorContext?.trim() || !ollamaReady) return;
    set({ assistantStatus: "thinking" });
    try {
      const { text } = await tauri.ollamaGenerate({
        model: ollamaModel,
        messages: [
          { role: "system", content: PROMPT_COMPLETE },
          { role: "user", content: userPromptComplete(cursorContext) }
        ],
      });
      const latex = extractLatex(text);
      set({
        assistantStatus: "idle",
        assistantMessages: [...assistantMessages, { role: "user", content: "Complete paragraph" }, { role: "assistant", content: latex }],
      });
      get().appendAtCursor(latex);
    } catch (e) {
      set({ assistantStatus: "error", assistantError: String(e) });
    }
  },

  applyFormulaToEditor: (latex) => set({ pendingReplaceSelection: latex, selectionText: undefined }),
  appendAtCursor: (latex) => set({ pendingInsertAtCursor: latex, cursorContext: undefined }),
  clearPendingReplace: () => set({ pendingReplaceSelection: undefined }),
  clearPendingInsert: () => set({ pendingInsertAtCursor: undefined }),
  clearAssistant: () => set({ assistantMessages: [], assistantStatus: "idle", assistantError: undefined }),

  rewriteEditorContent: async (instruction) => {
    const { texContent, ollamaModel, ollamaReady } = get();
    if (!ollamaReady) return;

    set({ assistantStatus: "thinking", assistantError: undefined });

    const prompt = `You are a LaTeX expert. Instruction: "${instruction}"
Output ONLY the raw LaTeX code inside a markdown code block.
Current Code:
${texContent}`;

    try {
      const { text } = await tauri.ollamaGenerate({
        model: ollamaModel,
        messages: [{ role: "user", content: prompt }],
      });

      const finalContent = extractLatex(text);
      get().setTexContent(finalContent);
      set({ assistantStatus: "idle" });
      get().setToast("Updated ✨", "success");
    } catch (e) {
      set({ assistantStatus: "error", assistantError: String(e) });
    }
  },
}));