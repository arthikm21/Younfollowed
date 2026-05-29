export interface Account {
  username: string;
  href: string;
  /** Unix timestamp in seconds. 0 if unknown. */
  timestamp: number;
}

export interface ParsedData {
  followers: Account[];
  following: Account[];
  pendingRequests: Account[];
  recentlyUnfollowed: Account[];
  /** Lowercased usernames the user has liked posts from. */
  likedUsernames: Set<string>;
  /** Lowercased usernames the user has commented on. */
  commentedUsernames: Set<string>;
  /** True when liked/commented data was present in the export. */
  hasEngagementData: boolean;
}

export interface EngagementEntry {
  username: string;
  score: number;
}

export interface AnalysisResult {
  followingCount: number;
  followersCount: number;
  notFollowingBack: Account[];
  youDontFollowBack: Account[];
  mutuals: Account[];
  /** Accounts that recently unfollowed you (from Instagram's export). */
  recentlyUnfollowed: Account[];
  /** Accounts you follow whose requests are still pending. */
  pendingRequests: Account[];
  /** True when liked/commented data was present in the export. */
  hasEngagementData: boolean;
  /** Accounts YOU engage with most (whose posts you like/comment on). */
  topEngaged: EngagementEntry[];
}
