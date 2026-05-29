export async function extractText(
  fileUrl: string,
  mimeType?: string
): Promise<string> {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

  const contentType = mimeType || response.headers.get("content-type") || "";
  const buffer = Buffer.from(await response.arrayBuffer());

  if (contentType.includes("pdf")) {
    return extractFromPdf(buffer);
  }

  if (
    contentType.includes("wordprocessingml") ||
    contentType.includes("docx") ||
    contentType.includes("msword") ||
    fileUrl.endsWith(".docx")
  ) {
    return extractFromDocx(buffer);
  }

  if (
    contentType.includes("text/plain") ||
    contentType.includes("text/html") ||
    contentType.includes("text/markdown") ||
    fileUrl.endsWith(".txt") ||
    fileUrl.endsWith(".md")
  ) {
    return buffer.toString("utf-8");
  }

  if (contentType.includes("json") || fileUrl.endsWith(".json")) {
    const parsed = JSON.parse(buffer.toString("utf-8"));
    return typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2);
  }

  return buffer.toString("utf-8");
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = await import("pdf-parse");
    const data = await pdfParse.default(buffer);
    return data.text || "";
  } catch (error) {
    console.error("[PDF Extractor] Error:", error);
    return buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("[DOCX Extractor] Error:", error);
    return buffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ").replace(/\s+/g, " ").trim();
  }
}
