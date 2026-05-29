import { describe, it, expect } from "vitest";
import { analyze } from "@/lib/analyzer";
import type { Account, ParsedData } from "@/types/instagram";

function acc(username: string, timestamp = 0): Account {
  return { username, href: `https://www.instagram.com/${username}`, timestamp };
}

function makeData(over: Partial<ParsedData> = {}): ParsedData {
  return {
    followers: [],
    following: [],
    pendingRequests: [],
    recentlyUnfollowed: [],
    likedUsernames: new Set<string>(),
    commentedUsernames: new Set<string>(),
    hasEngagementData: false,
    ...over,
  };
}

describe("analyze", () => {
  it("computes not-following-back (you follow them, they don't follow you)", () => {
    const r = analyze(
      makeData({ followers: [acc("alice")], following: [acc("alice"), acc("bob")] })
    );
    expect(r.notFollowingBack.map((x) => x.username)).toEqual(["bob"]);
  });

  it("computes you-don't-follow-back (they follow you, you don't follow them)", () => {
    const r = analyze(
      makeData({ followers: [acc("alice"), acc("carol")], following: [acc("alice")] })
    );
    expect(r.youDontFollowBack.map((x) => x.username)).toEqual(["carol"]);
  });

  it("computes mutuals", () => {
    const r = analyze(
      makeData({
        followers: [acc("alice"), acc("carol")],
        following: [acc("alice"), acc("bob")],
      })
    );
    expect(r.mutuals.map((x) => x.username)).toEqual(["alice"]);
  });

  it("matches usernames case-insensitively", () => {
    const r = analyze(
      makeData({ followers: [acc("Alice")], following: [acc("alice")] })
    );
    expect(r.mutuals.map((x) => x.username)).toEqual(["alice"]);
    expect(r.notFollowingBack).toEqual([]);
    expect(r.youDontFollowBack).toEqual([]);
  });

  it("handles empty inputs", () => {
    const r = analyze(makeData());
    expect(r.notFollowingBack).toEqual([]);
    expect(r.youDontFollowBack).toEqual([]);
    expect(r.mutuals).toEqual([]);
    expect(r.recentlyUnfollowed).toEqual([]);
    expect(r.topEngaged).toEqual([]);
    expect(r.hasEngagementData).toBe(false);
  });

  it("sorts recentlyUnfollowed newest-first", () => {
    const r = analyze(
      makeData({
        recentlyUnfollowed: [
          acc("old", 100),
          acc("new", 300),
          acc("mid", 200),
        ],
      })
    );
    expect(r.recentlyUnfollowed.map((x) => x.username)).toEqual([
      "new",
      "mid",
      "old",
    ]);
  });

  it("orders topEngaged by descending score", () => {
    const r = analyze(
      makeData({
        hasEngagementData: true,
        likedUsernames: new Set(["a", "b"]),
        commentedUsernames: new Set(["a"]),
      })
    );
    // "a" appears in both sets (score 2), "b" only in liked (score 1)
    expect(r.hasEngagementData).toBe(true);
    expect(r.topEngaged.map((x) => x.username)).toEqual(["a", "b"]);
    expect(r.topEngaged[0].score).toBe(2);
    expect(r.topEngaged[1].score).toBe(1);
  });

  it("hasEngagementData=false path yields no topEngaged even if sets present", () => {
    const r = analyze(
      makeData({
        hasEngagementData: false,
        likedUsernames: new Set(["a"]),
      })
    );
    expect(r.hasEngagementData).toBe(false);
    expect(r.topEngaged).toEqual([]);
  });
});
