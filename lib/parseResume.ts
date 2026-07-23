import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

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