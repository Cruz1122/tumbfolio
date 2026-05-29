export async function calculateFileSha256(file: File): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API no está disponible en este navegador.");
  }

  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = Array.from(new Uint8Array(digest));

  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
