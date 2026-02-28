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
  OllamaListModelsResult,
  OllamaGeneratePayload,
  OllamaGenerateResult,
} from "../state/types";

/** Read UTF-8 text file. */
export async function readTextFile(payload: ReadTextFilePayload): Promise<ReadTextFileResult> {
  return invoke<ReadTextFileResult>("read_text_file", payload as unknown as Record<string, unknown>);
}

/** Write text file. */
export async function writeTextFile(payload: WriteTextFilePayload): Promise<WriteTextFileResult> {
  return invoke<WriteTextFileResult>("write_text_file", payload as unknown as Record<string, unknown>);
}

/** Compile LaTeX (texPath or texContent). Returns log on failure too. */
export async function compileTex(payload: CompileTexPayload): Promise<CompileTexResult> {
  return invoke<CompileTexResult>("compile_tex", payload as unknown as Record<string, unknown>);
}

/** Open file picker; optional filters e.g. [{ name: "PDF", extensions: ["pdf"] }]. */
export async function pickFile(payload: PickFilePayload = {}): Promise<PickFileResult> {
  return invoke<PickFileResult>("pick_file", payload as unknown as Record<string, unknown>);
}

/** Copy a PDF into workspace; returns destination path. */
export async function copyPdfToWorkspace(
  payload: CopyPdfToWorkspacePayload
): Promise<CopyPdfToWorkspaceResult> {
  return invoke<CopyPdfToWorkspaceResult>("copy_pdf_to_workspace", payload as unknown as Record<string, unknown>);
}

/** List available Ollama models. */
export async function ollamaListModels(): Promise<OllamaListModelsResult> {
  return invoke<OllamaListModelsResult>("ollama_list_models", {});
}

/** Generate via Ollama (no direct fetch from frontend). */
export async function ollamaGenerate(
  payload: OllamaGeneratePayload
): Promise<OllamaGenerateResult> {
  return invoke<OllamaGenerateResult>("ollama_generate", payload as unknown as Record<string, unknown>);
}
