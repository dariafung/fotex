import { invoke } from "@tauri-apps/api/core";
import type {
  ReadTextFilePayload,
  ReadTextFileResult,
  WriteTextFilePayload,
  WriteTextFileResult,
  CompileTexPayload,
  CompileTexResult,
  PickFilePayload,
  PickFileResult,
  CopyPdfToWorkspacePayload,
  CopyPdfToWorkspaceResult,
} from "../state/types";

export interface ReadPdfPayload { path: string; }

// --- 文件系统操作 ---

export async function readTextFile(payload: ReadTextFilePayload): Promise<ReadTextFileResult> {
  return invoke<ReadTextFileResult>("read_text_file", { payload });
}

export async function writeTextFile(payload: WriteTextFilePayload): Promise<WriteTextFileResult> {
  return invoke<WriteTextFileResult>("write_text_file", { payload });
}

export async function pickFile(payload: PickFilePayload = {}): Promise<PickFileResult> {
  return invoke<PickFileResult>("pick_file", { payload });
}

export async function copyPdfToWorkspace(payload: CopyPdfToWorkspacePayload): Promise<CopyPdfToWorkspaceResult> {
  return invoke<CopyPdfToWorkspaceResult>("copy_pdf_to_workspace", { payload });
}

export interface ReadMainTexResult {
  content: string;
  texPath?: string;
  workspaceDir?: string;
}

export async function readMainTex(): Promise<ReadMainTexResult> {
  return invoke<ReadMainTexResult>("read_tex");
}

export async function readPdfBase64(payload: ReadPdfPayload): Promise<string> {
  return invoke<string>("read_pdf_base64", { payload });
}

export async function readFolder(path: string): Promise<FileNode> {
  return invoke<FileNode>("read_folder", { path });
}

export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  children: FileNode[];
}

// --- 编译操作 ---

export async function compileTex(payload: CompileTexPayload): Promise<CompileTexResult> {
  const content = payload.texContent ?? "";
  const texPath = payload.texPath;
  try {
    const pdfPath = await invoke<string>("compile_latex", {
      content,
      texPath: texPath ?? null,
    });
    return { success: true, pdfPath, log: "Compiled successfully." };
  } catch (e) {
    return { success: false, log: String(e) };
  }
}

// --- ✨ Ollama & AI 操作 (重点更新) ---

/** 1. 获取模型列表，需要传入用户配置的 baseUrl */
export async function ollamaListModels(baseUrl: string) {
  // 注意：Tauri 会自动将 camelCase 的 baseUrl 映射到 Rust 的 base_url
  return invoke<{ models: string[] }>("ollama_list_models", { baseUrl });
}

/** 2. 通用生成接口 */
export async function ollamaGenerate(args: { 
  baseUrl: string; 
  model: string; 
  messages: { role: string; content: string }[] 
}) {
  return invoke<{ text: string }>("ollama_generate", args);
}

/** 3. 错误修复接口 */
export async function fixLatexError(args: { 
  baseUrl: string; 
  model: string; 
  snippet: string; 
  errorMsg: string 
}): Promise<string> {
  return invoke<string>("fix_latex_error", args);
}

/** 4. 公式转换接口 */
export async function toLatexFormula(args: { 
  baseUrl: string; 
  model: string; 
  snippet: string 
}): Promise<string> {
  return invoke<string>("to_latex_formula", args);
}

/** 5. 自动补全接口 */
export async function autocompleteLatex(args: { 
  baseUrl: string; 
  model: string; 
  prefix: string 
}): Promise<string> {
  return invoke<string>("autocomplete_latex", args);
}