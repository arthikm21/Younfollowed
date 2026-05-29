import type {
  Account,
  AnalysisResult,
  EngagementEntry,
  ParsedData,
} from "@/types/instagram";

function toSet(accounts: Account[]): Set<string> {
  return new Set(accounts.map((a) => a.username.toLowerCase()));
}

export function analyze(data: ParsedData): AnalysisResult {
  const followerSet = toSet(data.followers);
  const followingSet = toSet(data.following);

  const notFollowingBack = data.following.filter(
    (a) => !followerSet.has(a.username.toLowerCase())
  );

  const youDontFollowBack = data.followers.filter(
    (a) => !followingSet.has(a.username.toLowerCase())
  );

  const mutuals = data.following.filter((a) =>
    followerSet.has(a.username.toLowerCase())
  );

  // Recently unfollowed: accounts that unfollowed you, taken directly from
  // Instagram's recently_unfollowed_profiles.json (real data, not inferred).
  const recentlyUnfollowed = [...data.recentlyUnfollowed].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  // Accounts YOU engage with most: count of posts/comments of theirs you
  // interacted with. (Instagram's export only records who YOU engage with,
  // never who engages with you — so this is framed honestly.)
  let topEngaged: EngagementEntry[] = [];
  if (data.hasEngagementData) {
    const scores = new Map<string, number>();
    const bump = (set: Set<string>) => {
      for (const u of set) scores.set(u, (scores.get(u) ?? 0) + 1);
    };
    bump(data.likedUsernames);
    bump(data.commentedUsernames);
    topEngaged = Array.from(scores.entries())
      .map(([username, score]) => ({ username, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  return {
    followingCount: data.following.length,
    followersCount: data.followers.length,
    notFollowingBack,
    youDontFollowBack,
    mutuals,
    recentlyUnfollowed,
    pendingRequests: data.pendingRequests,
    hasEngagementData: data.hasEngagementData,
    topEngaged,
  };
}
