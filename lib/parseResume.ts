import mammoth from "mammoth";
import { createRequire } from "module";
import DOMMatrixPolyfill from "dommatrix";

const require = createRequire(import.meta.url);

// pdf-parse's underlying PDF engine expects browser APIs like DOMMatrix,
// which don't exist in Vercel's serverless Node.js runtime (only in
// browsers and in local dev). This polyfill fills that gap so PDF parsing
// works the same in production as it does locally.
if (typeof globalThis.DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = DOMMatrixPolyfill;
}

export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    const { PDFParse } = require("pdf-parse");
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text.trim();
    } catch (err) {
      throw new Error(
        "This file doesn't look like a valid PDF. Try re-saving or re-exporting it, or upload a DOCX instead."
      );
    }
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (mimeType === "text/plain") {
    return buffer.toString("utf-8").trim();
  }

  throw new Error(
    `Unsupported file type: ${mimeType}. Accepted: PDF, DOCX, or plain text.`
  );
}