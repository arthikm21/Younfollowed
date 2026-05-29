import { describe, it, expect } from "vitest";
import { formatCount, formatLongDate, formatMonthYear } from "@/lib/format";

describe("formatCount", () => {
  it("adds thousands separators", () => {
    expect(formatCount(1234)).toBe("1,234");
    expect(formatCount(1000000)).toBe("1,000,000");
  });
  it("handles small numbers", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(42)).toBe("42");
  });
  it("handles non-finite input gracefully", () => {
    expect(formatCount(NaN)).toBe("0");
    expect(formatCount(Infinity)).toBe("0");
  });
});

describe("formatLongDate", () => {
  it("formats a Unix-seconds timestamp", () => {
    // 2024-03-12 UTC
    const seconds = Math.floor(Date.UTC(2024, 2, 12) / 1000);
    expect(formatLongDate(seconds)).toBe("Mar 12, 2024");
  });
  it("returns empty string for unknown (0)", () => {
    expect(formatLongDate(0)).toBe("");
  });
});

describe("formatMonthYear", () => {
  it("formats month + year", () => {
    const seconds = Math.floor(Date.UTC(2023, 0, 4) / 1000);
    expect(formatMonthYear(seconds)).toBe("Jan 2023");
  });
  it("returns empty string for 0", () => {
    expect(formatMonthYear(0)).toBe("");
  });
});
