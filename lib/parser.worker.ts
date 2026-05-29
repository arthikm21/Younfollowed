import { parseInstagramZipCore } from "./parser-core";
import type { ParsedData } from "@/types/instagram";

type ParseRequest = { type: "parse"; file: File };
type ParseResponse =
  | { type: "ok"; data: ParsedData }
  | { type: "error"; message: string };

self.addEventListener("message", async (ev: MessageEvent<ParseRequest>) => {
  if (ev.data?.type !== "parse") return;
  try {
    const data = await parseInstagramZipCore(ev.data.file);
    const res: ParseResponse = { type: "ok", data };
    (self as unknown as Worker).postMessage(res);
  } catch (e) {
    const res: ParseResponse = {
      type: "error",
      message: e instanceof Error ? e.message : "Failed to parse file.",
    };
    (self as unknown as Worker).postMessage(res);
  }
});
