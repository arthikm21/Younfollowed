import JSZip from "jszip";
import type { Account, ParsedData } from "@/types/instagram";

/**
 * Recursively walk any JSON value and extract every `string_list_data`
 * entry into a normalized Account. Instagram nests these inside arrays
 * and objects (e.g. `relationships_following`), and the shapes vary
 * between export versions, so we search defensively.
 */
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
      // string_list_data fully describes this entry; no need to recurse deeper.
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

const MAX_FILE_BYTES = 200 * 1024 * 1024; // ~200MB

/** Filenames that indicate this really is an Instagram export, even if the
 * followers/following files happen to be missing or unselected. */
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

export async function parseInstagramZip(file: File): Promise<ParsedData> {
  if (typeof file.size === "number" && file.size > MAX_FILE_BYTES) {
    throw new Error(
      "That file is too large (over 200MB). Please request a smaller export — selecting only \"Followers and Following\" keeps the file small."
    );
  }

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    throw new Error(
      "We couldn't open that file. Make sure it's the .zip Instagram emailed you."
    );
  }

  const jsonFiles: { name: string; base: string; entry: JSZip.JSZipObject }[] =
    [];
  let sawHtml = false;

  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    const base = basename(relativePath);
    if (base.endsWith(".json")) {
      jsonFiles.push({ name: relativePath, base, entry });
    } else if (base.endsWith(".html") || base.endsWith(".htm")) {
      sawHtml = true;
    }
  });

  if (jsonFiles.length === 0) {
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

  for (const f of jsonFiles) {
    const text = await f.entry.async("string");
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      continue;
    }

    const name = f.base;

    if (matches(name, INSTAGRAM_HINTS)) looksLikeInstagram = true;

    if (matches(name, [/^followers(_\d+)?\.json$/, /^followers\.json$/])) {
      extractAccounts(data, followers);
      foundRelationshipFile = true;
    } else if (matches(name, [/^following(_\d+)?\.json$/])) {
      extractAccounts(data, following);
      foundRelationshipFile = true;
    } else if (matches(name, [/^pending_follow_requests\.json$/])) {
      extractAccounts(data, pendingRequests);
    } else if (
      matches(name, [
        /^recently_unfollowed_profiles\.json$/,
        /^recently_unfollowed_accounts\.json$/,
      ])
    ) {
      extractAccounts(data, recentlyUnfollowed);
    } else if (matches(name, [/^liked_posts\.json$/, /^liked_comments\.json$/])) {
      hasLiked = true;
      const acc: Account[] = [];
      extractAccounts(data, acc);
      for (const a of acc) likedUsernames.add(a.username.toLowerCase());
    } else if (matches(name, [/^post_comments(_\d+)?\.json$/])) {
      hasCommented = true;
      const acc: Account[] = [];
      extractAccounts(data, acc);
      for (const a of acc) commentedUsernames.add(a.username.toLowerCase());
    }
  }

  if (!foundRelationshipFile || (followers.length === 0 && following.length === 0)) {
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
