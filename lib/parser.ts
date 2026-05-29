import { parseInstagramZipCore } from "./parser-core";
import type { ParsedData } from "@/types/instagram";

type ParseResponse =
  | { type: "ok"; data: ParsedData }
  | { type: "error"; message: string };

/**
 * Parse an Instagram ZIP export. In the browser, runs in a Web Worker so the
 * main thread stays responsive on multi-GB archives. The worker bundle is
 * built at compile time into `public/parser.worker.js`. Falls back to inline
 * execution if Worker is unavailable (SSR, tests).
 */
export function parseInstagramZip(file: File): Promise<ParsedData> {
  if (typeof Worker === "undefined") {
    return parseInstagramZipCore(file);
  }

  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker("/parser.worker.js");
    } catch {
      parseInstagramZipCore(file).then(resolve, reject);
      return;
    }

    worker.addEventListener("message", (ev: MessageEvent<ParseResponse>) => {
      if (ev.data.type === "ok") resolve(ev.data.data);
      else reject(new Error(ev.data.message));
      worker.terminate();
    });

    worker.addEventListener("error", (ev) => {
      reject(new Error(ev.message || "Worker failed."));
      worker.terminate();
    });

    worker.postMessage({ type: "parse", file });
  });
}
