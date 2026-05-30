import { parseInstagramZipCore } from "./parser-core";
import type { ParsedData } from "@/types/instagram";

/**
 * Parse an Instagram ZIP export.
 *
 * Runs inline (no Web Worker). zip.js's BlobReader streams entries directly
 * from the Blob without loading the whole archive into memory, and we only
 * decompress the few small relationship JSON files we actually need
 * (typically a few hundred KB total), so parsing is fast and memory stays
 * bounded even on multi-GB exports. Keeping this on the main thread makes the
 * build deterministic across local and Cloudflare — no separately-bundled
 * worker that can go stale or fail to build in production.
 */
export function parseInstagramZip(file: File): Promise<ParsedData> {
  return parseInstagramZipCore(file);
}
