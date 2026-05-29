const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Format a Unix-seconds timestamp like "Mar 2024". Empty for unknown. */
export function formatMonthYear(timestamp: number): string {
  if (!timestamp) return "";
  const d = new Date(timestamp * 1000);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Format like "Mar 12, 2024". */
export function formatLongDate(timestamp: number): string {
  if (!timestamp) return "";
  const d = new Date(timestamp * 1000);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Format a count with thousands separators, e.g. 1234 -> "1,234". */
export function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("en-US");
}

const AVATAR_COLORS = [
  "#5e5ce6", "#ff375f", "#0a84ff", "#30d158", "#ff9f0a",
  "#bf5af2", "#64d2ff", "#5856d6", "#34a853", "#ff453a",
];

export function avatarColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initials(username: string): string {
  const clean = username.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length === 0) return "??";
  if (clean.length === 1) return clean[0].toUpperCase();
  return (clean[0] + clean[1]).toUpperCase();
}
