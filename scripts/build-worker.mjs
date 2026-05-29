import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";

await build({
  entryPoints: [path.join(root, "lib/parser.worker.ts")],
  outfile: path.join(root, "public/parser.worker.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: true,
  sourcemap: false,
  alias: {
    "@": root,
  },
});

console.log("built public/parser.worker.js");
