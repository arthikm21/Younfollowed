import {
  BlobReader,
  TextWriter,
  ZipReader,
  configure,
  type Entry,
} from "@zip.js/zip.js";
import type { Account, ParsedData } from "@/types/instagram";

// Avoid spawning nested workers from inside our own parser worker.
configure({ useWebWorkers: false });

function extractAccounts(node: unknown, out: Account[]): void {
  if (node === null || node === undefined) return;

  if (Array.isArray(node)) {
    for (const item of node) extractAccounts(item, out);
    return;
  }

  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;

    if (Array.isArray(obj.string_list_data)) {
      const entries = obj.string_list_data as Array<Record<string, unknown>>;
      for (const e of entries) {
        const value = typeof e.value === "string" ? e.value.trim() : "";
        const href = typeof e.href === "string" ? e.href : "";
        const username = value || hrefToUsername(href);
        if (username && username.trim()) {
          out.push({
            username,
            href: href || `https://www.instagram.com/${username}`,
            timestamp: typeof e.timestamp === "number" ? e.timestamp : 0,
          });
        }
      }
      return;
    }

    for (const key of Object.keys(obj)) extractAccounts(obj[key], out);
  }
}

function hrefToUsername(href: string): string {
  if (!href) return "";
  try {
    const u = new URL(href);
    return u.pathname.replace(/\//g, "").trim();
  } catch {
    return "";
  }
}

function dedupe(accounts: Account[]): Account[] {
  const map = new Map<string, Account>();
  for (const a of accounts) {
    const key = a.username.toLowerCase();
    if (!key) continue;
    const existing = map.get(key);
    if (!existing || (a.timestamp && !existing.timestamp)) {
      map.set(key, a);
    }
  }
  return Array.from(map.values());
}

function matches(name: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(name));
}

function basename(path: string): string {
  return path.split("/").pop()?.toLowerCase() ?? "";
}

const INSTAGRAM_HINTS: RegExp[] = [
  /^pending_follow_requests\.json$/,
  /^recently_unfollowed_profiles\.json$/,
  /^recently_unfollowed_accounts\.json$/,
  /^close_friends\.json$/,
  /^blocked_profiles\.json$/,
  /^liked_posts\.json$/,
  /^liked_comments\.json$/,
  /^post_comments(_\d+)?\.json$/,
  /^follow_requests_you've_received\.json$/,
  /^accounts_you'?re_not_interested_in\.json$/,
  /^restricted_profiles\.json$/,
  /^profile_.*\.json$/,
  /^personal_information\.json$/,
];

const FOLLOWERS_RE = /^followers(_\d+)?\.json$/;
const FOLLOWING_RE = /^following(_\d+)?\.json$/;
const PENDING_RE = /^pending_follow_requests\.json$/;
const UNFOLLOWED_RE = /^recently_unfollowed_(profiles|accounts)\.json$/;
const LIKED_RE = /^(liked_posts|liked_comments)\.json$/;
const COMMENTED_RE = /^post_comments(_\d+)?\.json$/;

/** Entries we will actually decompress. Everything else (messages, media,
 * archive blobs) is skipped entirely — only the central directory is read. */
function shouldDecompress(base: string): boolean {
  return (
    FOLLOWERS_RE.test(base) ||
    FOLLOWING_RE.test(base) ||
    PENDING_RE.test(base) ||
    UNFOLLOWED_RE.test(base) ||
    LIKED_RE.test(base) ||
    COMMENTED_RE.test(base) ||
    matches(base, INSTAGRAM_HINTS)
  );
}

export async function parseInstagramZipCore(
  file: Blob
): Promise<ParsedData> {
  let entries: Entry[];
  let reader: ZipReader<unknown>;
  try {
    reader = new ZipReader(new BlobReader(file));
    entries = await reader.getEntries();
  } catch {
    throw new Error(
      "We couldn't open that file. Make sure it's the .zip Instagram emailed you."
    );
  }

  let sawJson = false;
  let sawHtml = false;
  for (const e of entries) {
    if (e.directory) continue;
    const base = basename(e.filename);
    if (base.endsWith(".json")) sawJson = true;
    else if (base.endsWith(".html") || base.endsWith(".htm")) sawHtml = true;
  }

  if (!sawJson) {
    await reader.close();
    if (sawHtml) {
      throw new Error(
        "This export is in HTML format. Please request a new download and choose JSON format instead."
      );
    }
    throw new Error(
      "This doesn't look like an Instagram data export. No JSON files were found inside the ZIP."
    );
  }

  const followers: Account[] = [];
  const following: Account[] = [];
  const pendingRequests: Account[] = [];
  const recentlyUnfollowed: Account[] = [];
  const likedUsernames = new Set<string>();
  const commentedUsernames = new Set<string>();
  let hasLiked = false;
  let hasCommented = false;
  let foundRelationshipFile = false;
  let looksLikeInstagram = false;

  for (const entry of entries) {
    if (entry.directory) continue;
    const base = basename(entry.filename);
    if (!base.endsWith(".json")) continue;
    if (!shouldDecompress(base)) continue;

    if (matches(base, INSTAGRAM_HINTS)) looksLikeInstagram = true;

    if (!entry.getData) continue;
    let text: string;
    try {
      text = await entry.getData(new TextWriter());
    } catch {
      continue;
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      continue;
    }

    if (FOLLOWERS_RE.test(base)) {
      extractAccounts(data, followers);
      foundRelationshipFile = true;
    } else if (FOLLOWING_RE.test(base)) {
      extractAccounts(data, following);
      foundRelationshipFile = true;
    } else if (PENDING_RE.test(base)) {
      extractAccounts(data, pendingRequests);
    } else if (UNFOLLOWED_RE.test(base)) {
      extractAccounts(data, recentlyUnfollowed);
    } else if (LIKED_RE.test(base)) {
      hasLiked = true;
      const acc: Account[] = [];
      extractAccounts(data, acc);
      for (const a of acc) likedUsernames.add(a.username.toLowerCase());
    } else if (COMMENTED_RE.test(base)) {
      hasCommented = true;
      const acc: Account[] = [];
      extractAccounts(data, acc);
      for (const a of acc) commentedUsernames.add(a.username.toLowerCase());
    }
  }

  await reader.close();

  if (
    !foundRelationshipFile ||
    (followers.length === 0 && following.length === 0)
  ) {
    if (!looksLikeInstagram) {
      throw new Error(
        "This ZIP doesn't look like an Instagram data export. Please upload the .zip Instagram emailed you after a \"Download Your Information\" request."
      );
    }
    throw new Error(
      "We found JSON files, but no followers/following data. Make sure you selected \"Followers and Following\" when requesting your export."
    );
  }

  return {
    followers: dedupe(followers),
    following: dedupe(following),
    pendingRequests: dedupe(pendingRequests),
    recentlyUnfollowed: dedupe(recentlyUnfollowed),
    likedUsernames,
    commentedUsernames,
    hasEngagementData: hasLiked || hasCommented,
  };
}
