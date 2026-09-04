import { describe, expect, it } from "vitest";
import { formatCurrency, formatDuration } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats cents in euros for Portugal", () => {
    expect(formatCurrency(3200)).toContain("32");
    expect(formatCurrency(3200)).toContain("€");
  });
});

describe("formatDuration", () => {
  it("formats hours and remaining minutes", () => {
    expect(formatDuration(105)).toBe("1 h 45 min");
  });

  it("formats durations below one hour", () => {
    expect(formatDuration(45)).toBe("45 min");
  });
});
