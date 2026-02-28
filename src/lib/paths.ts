import { convertFileSrc } from "@tauri-apps/api/core";

/**
 * Build a PDF URL for use in iframe/src with cache busting so the viewer
 * refreshes after each compile or upload.
 */
export function pdfUrl(pdfPath: string): string {
  const src = convertFileSrc(pdfPath);
  return `${src}?t=${Date.now()}`;
}
