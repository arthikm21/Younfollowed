import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { parseInstagramZip } from "@/lib/parser";

// Build a File-like object from a JSZip instance. parseInstagramZip only uses
// `.size` and hands the object to JSZip.loadAsync (which accepts Uint8Array).
async function zipToFile(zip: JSZip, sizeOverride?: number): Promise<File> {
  const buf = await zip.generateAsync({ type: "uint8array" });
  const f = buf as unknown as File & { size: number };
  Object.defineProperty(f, "size", {
    value: sizeOverride ?? buf.byteLength,
    configurable: true,
  });
  return f;
}

function entry(username: string, timestamp = 1000, href = "") {
  return { string_list_data: [{ value: username, href, timestamp }] };
}

function followingFile(users: string[]) {
  return { relationships_following: users.map((u) => entry(u)) };
}

describe("parseInstagramZip", () => {
  it("parses classic followers_1.json + following.json (relationships_following shape)", async () => {
    const zip = new JSZip();
    zip.file("followers_1.json", JSON.stringify([entry("alice"), entry("bob")]));
    zip.file("following.json", JSON.stringify(followingFile(["alice", "carol"])));
    const data = await parseInstagramZip(await zipToFile(zip));
    expect(data.followers.map((f) => f.username).sort()).toEqual(["alice", "bob"]);
    expect(data.following.map((f) => f.username).sort()).toEqual(["alice", "carol"]);
  });

  it("merges split followers_1.json + followers_2.json", async () => {
    const zip = new JSZip();
    zip.file("followers_1.json", JSON.stringify([entry("a"), entry("b")]));
    zip.file("followers_2.json", JSON.stringify([entry("c")]));
    zip.file("following.json", JSON.stringify(followingFile(["a"])));
    const data = await parseInstagramZip(await zipToFile(zip));
    expect(data.followers.map((f) => f.username).sort()).toEqual(["a", "b", "c"]);
  });

  it("handles the newer nested connections/followers_and_following path", async () => {
    const zip = new JSZip();
    const dir = "connections/followers_and_following/";
    zip.file(dir + "followers_1.json", JSON.stringify([entry("nested1")]));
    zip.file(dir + "following.json", JSON.stringify(followingFile(["nested2"])));
    const data = await parseInstagramZip(await zipToFile(zip));
    expect(data.followers.map((f) => f.username)).toEqual(["nested1"]);
    expect(data.following.map((f) => f.username)).toEqual(["nested2"]);
  });

  it("throws the JSON-format error for an HTML-only export", async () => {
    const zip = new JSZip();
    zip.file(
      "connections/followers_and_following/followers_1.html",
      "<html></html>"
    );
    await expect(parseInstagramZip(await zipToFile(zip))).rejects.toThrow(
      /HTML format/i
    );
  });

  it("throws a distinct error for a non-Instagram zip", async () => {
    const zip = new JSZip();
    zip.file("budget.json", JSON.stringify({ totals: [1, 2, 3] }));
    await expect(parseInstagramZip(await zipToFile(zip))).rejects.toThrow(
      /doesn't look like an Instagram/i
    );
  });

  it("rejects an oversized file before loading", async () => {
    const zip = new JSZip();
    zip.file("followers_1.json", JSON.stringify([entry("a")]));
    const big = await zipToFile(zip, 1100 * 1024 * 1024);
    await expect(parseInstagramZip(big)).rejects.toThrow(/too large/i);
  });

  it("skips a malformed JSON file without crashing the whole parse", async () => {
    const zip = new JSZip();
    zip.file("followers_1.json", "{not valid json");
    zip.file("following.json", JSON.stringify(followingFile(["alice"])));
    const data = await parseInstagramZip(await zipToFile(zip));
    expect(data.followers).toEqual([]);
    expect(data.following.map((f) => f.username)).toEqual(["alice"]);
  });

  it("extracts username from href when value is missing", async () => {
    const zip = new JSZip();
    zip.file(
      "followers_1.json",
      JSON.stringify([entry("", 1, "https://www.instagram.com/fromhref/")])
    );
    zip.file("following.json", JSON.stringify(followingFile(["x"])));
    const data = await parseInstagramZip(await zipToFile(zip));
    expect(data.followers.map((f) => f.username)).toEqual(["fromhref"]);
  });

  it("throws for an empty zip with no JSON files", async () => {
    const zip = new JSZip();
    await expect(parseInstagramZip(await zipToFile(zip))).rejects.toThrow(
      /No JSON files were found/i
    );
  });
});
