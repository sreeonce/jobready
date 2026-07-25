import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    try {
      const uint8Array = new Uint8Array(buffer);
      const pdf = await getDocumentProxy(uint8Array);
      const { text } = await extractText(pdf, { mergePages: true });
      return text.trim();
    } catch (err) {
      console.error("PDF parsing error:", err);
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