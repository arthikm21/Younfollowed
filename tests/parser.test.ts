import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { parseInstagramZipCore } from "@/lib/parser-core";

// Build a real Blob from a JSZip instance. parser-core uses zip.js's BlobReader,
// which needs Blob.slice() — a Uint8Array won't do.
async function zipToBlob(zip: JSZip): Promise<Blob> {
  const buf = await zip.generateAsync({ type: "uint8array" });
  return new Blob([buf]);
}

function entry(username: string, timestamp = 1000, href = "") {
  return { string_list_data: [{ value: username, href, timestamp }] };
}

function followingFile(users: string[]) {
  return { relationships_following: users.map((u) => entry(u)) };
}

describe("parseInstagramZipCore", () => {
  it("parses classic followers_1.json + following.json (relationships_following shape)", async () => {
    const zip = new JSZip();
    zip.file("followers_1.json", JSON.stringify([entry("alice"), entry("bob")]));
    zip.file("following.json", JSON.stringify(followingFile(["alice", "carol"])));
    const data = await parseInstagramZipCore(await zipToBlob(zip));
    expect(data.followers.map((f) => f.username).sort()).toEqual(["alice", "bob"]);
    expect(data.following.map((f) => f.username).sort()).toEqual(["alice", "carol"]);
  });

  it("merges split followers_1.json + followers_2.json", async () => {
    const zip = new JSZip();
    zip.file("followers_1.json", JSON.stringify([entry("a"), entry("b")]));
    zip.file("followers_2.json", JSON.stringify([entry("c")]));
    zip.file("following.json", JSON.stringify(followingFile(["a"])));
    const data = await parseInstagramZipCore(await zipToBlob(zip));
    expect(data.followers.map((f) => f.username).sort()).toEqual(["a", "b", "c"]);
  });

  it("handles the newer nested connections/followers_and_following path", async () => {
    const zip = new JSZip();
    const dir = "connections/followers_and_following/";
    zip.file(dir + "followers_1.json", JSON.stringify([entry("nested1")]));
    zip.file(dir + "following.json", JSON.stringify(followingFile(["nested2"])));
    const data = await parseInstagramZipCore(await zipToBlob(zip));
    expect(data.followers.map((f) => f.username)).toEqual(["nested1"]);
    expect(data.following.map((f) => f.username)).toEqual(["nested2"]);
  });

  it("throws the JSON-format error for an HTML-only export", async () => {
    const zip = new JSZip();
    zip.file(
      "connections/followers_and_following/followers_1.html",
      "<html></html>"
    );
    await expect(parseInstagramZipCore(await zipToBlob(zip))).rejects.toThrow(
      /HTML format/i
    );
  });

  it("throws a distinct error for a non-Instagram zip", async () => {
    const zip = new JSZip();
    zip.file("budget.json", JSON.stringify({ totals: [1, 2, 3] }));
    await expect(parseInstagramZipCore(await zipToBlob(zip))).rejects.toThrow(
      /doesn't look like an Instagram/i
    );
  });

  it("skips a malformed JSON file without crashing the whole parse", async () => {
    const zip = new JSZip();
    zip.file("followers_1.json", "{not valid json");
    zip.file("following.json", JSON.stringify(followingFile(["alice"])));
    const data = await parseInstagramZipCore(await zipToBlob(zip));
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
    const data = await parseInstagramZipCore(await zipToBlob(zip));
    expect(data.followers.map((f) => f.username)).toEqual(["fromhref"]);
  });

  it("ignores Threads follower/following files bundled under your_instagram_activity/threads/", async () => {
    const zip = new JSZip();
    zip.file(
      "connections/followers_and_following/followers_1.json",
      JSON.stringify([entry("alice"), entry("bob")])
    );
    zip.file(
      "connections/followers_and_following/following.json",
      JSON.stringify(followingFile(["alice", "carol"]))
    );
    // Threads bundles its own social graph — must NOT be counted.
    zip.file(
      "your_instagram_activity/threads/followers.json",
      JSON.stringify([entry("threadsperson")])
    );
    zip.file(
      "your_instagram_activity/threads/following.json",
      JSON.stringify(followingFile(["threadsfriend1", "threadsfriend2"]))
    );
    const data = await parseInstagramZipCore(await zipToBlob(zip));
    expect(data.followers.map((f) => f.username).sort()).toEqual(["alice", "bob"]);
    expect(data.following.map((f) => f.username).sort()).toEqual(["alice", "carol"]);
  });

  it("throws for an empty zip with no JSON files", async () => {
    const zip = new JSZip();
    await expect(parseInstagramZipCore(await zipToBlob(zip))).rejects.toThrow(
      /No JSON files were found/i
    );
  });
});
