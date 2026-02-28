import { pdfUrl } from "../../lib/paths";

interface PdfPreviewProps {
  pdfPath: string | undefined;
}

export function PdfPreview({ pdfPath }: PdfPreviewProps) {
  if (!pdfPath) {
    return (
      <div className="pdf-preview pdf-preview--empty">
        <p>No PDF. Compile your .tex or upload a PDF.</p>
      </div>
    );
  }
  const url = pdfUrl(pdfPath);
  return (
    <div className="pdf-preview">
      <iframe title="PDF" src={url} className="pdf-iframe" />
    </div>
  );
}
