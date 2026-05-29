import type { Account, ParsedData } from "@/types/instagram";

function ts(year: number, month: number, day = 15): number {
  return Math.floor(new Date(Date.UTC(year, month - 1, day)).getTime() / 1000);
}

function acc(username: string, timestamp: number): Account {
  return {
    username,
    href: `https://www.instagram.com/${username}`,
    timestamp,
  };
}

// People you follow (312 trimmed to a representative set).
const following: Account[] = [
  acc("alex.lifts", ts(2023, 3, 12)),
  acc("sara.makes", ts(2023, 1, 4)),
  acc("tomkayDesign", ts(2022, 11, 20)),
  acc("julia.photos", ts(2022, 8, 7)),
  acc("ryanb.eats", ts(2022, 9, 29)),
  acc("maya.narratives", ts(2023, 2, 14)),
  acc("d.herrera_art", ts(2022, 12, 1)),
  acc("christinawrites", ts(2023, 7, 18)),
  acc("nk.travels", ts(2022, 4, 3)),
  acc("the.coffee.lab", ts(2023, 5, 22)),
  acc("hannah.runs", ts(2023, 6, 11)),
  acc("studio.kona", ts(2022, 10, 9)),
  // mutuals (also followers)
  acc("jess.c", ts(2021, 9, 14)),
  acc("marco_v", ts(2021, 12, 2)),
  acc("priyak", ts(2022, 1, 30)),
  acc("hal.studio", ts(2022, 7, 8)),
  acc("ben.draws", ts(2022, 3, 17)),
  acc("noor.eats", ts(2023, 4, 21)),
  acc("liam.codes", ts(2021, 11, 5)),
  acc("emma.films", ts(2022, 6, 19)),
];

// People who follow you.
const followers: Account[] = [
  // mutuals (engaged)
  acc("jess.c", ts(2021, 9, 14)),
  acc("marco_v", ts(2021, 12, 2)),
  acc("priyak", ts(2022, 1, 30)),
  acc("hal.studio", ts(2022, 7, 8)),
  acc("ben.draws", ts(2022, 3, 17)),
  acc("noor.eats", ts(2023, 4, 21)),
  acc("liam.codes", ts(2021, 11, 5)),
  acc("emma.films", ts(2022, 6, 19)),
  // follow you, you don't follow back
  acc("lena.moves", ts(2024, 5, 2)),
  acc("paulo.outdoors", ts(2024, 6, 15)),
  acc("s_jayaweera", ts(2024, 2, 28)),
  acc("braxton.official", ts(2024, 1, 9)),
  // ghost followers (no engagement)
  acc("user_4829", ts(2021, 10, 3)),
  acc("ghost.handle99", ts(2022, 2, 18)),
  acc("x.a_accounts", ts(2021, 8, 27)),
  acc("followback_2021", ts(2021, 5, 12)),
  acc("np_lurker", ts(2022, 1, 6)),
  acc("silent.sam", ts(2022, 9, 1)),
  acc("quiet_quinn", ts(2023, 3, 25)),
];

// Engagement: usernames that liked your posts.
const likedUsernames = new Set<string>([
  "jess.c",
  "jess.c",
  "marco_v",
  "priyak",
  "hal.studio",
  "ben.draws",
  "lena.moves",
]);

// Usernames that commented on your posts.
const commentedUsernames = new Set<string>([
  "jess.c",
  "marco_v",
  "noor.eats",
  "emma.films",
]);

export function getSampleData(): ParsedData {
  return {
    followers,
    following,
    pendingRequests: [
      acc("future.friend", ts(2024, 7, 1)),
      acc("pending.pat", ts(2024, 6, 20)),
    ],
    recentlyUnfollowed: [
      acc("old.buddy", ts(2024, 4, 10)),
      acc("fitness_fad22", ts(2024, 3, 2)),
      acc("ex.coworker.k", ts(2024, 2, 18)),
      acc("brand.promo.x", ts(2024, 1, 25)),
      acc("travel_with_meh", ts(2023, 12, 9)),
    ],
    likedUsernames,
    commentedUsernames,
    hasEngagementData: true,
  };
}
