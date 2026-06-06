// Server-only resume text extraction for PDF and DOCX files.
import { extractText, getDocumentProxy } from "unpdf";
import { unzipSync, strFromU8 } from "fflate";

export async function extractResumeText(
  fileName: string,
  bytes: Uint8Array,
): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) {
    const pdf = await getDocumentProxy(bytes);
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join("\n") : String(text);
  }
  if (lower.endsWith(".docx")) {
    const files = unzipSync(bytes);
    const docXml = files["word/document.xml"];
    if (!docXml) throw new Error("Invalid DOCX: missing word/document.xml");
    const xml = strFromU8(docXml);
    // Convert <w:p> breaks to newlines, strip remaining tags.
    return xml
      .replace(/<w:p[^>]*>/g, "\n")
      .replace(/<w:br[^>]*\/>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  throw new Error("Unsupported file type. Upload PDF or DOCX.");
}
