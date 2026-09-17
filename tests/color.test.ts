import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "@/lib/color";

describe("relativeLuminance", () => {
  it("returns 0 for black and 1 for white", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("accepts hex with or without a leading hash, any case", () => {
    expect(relativeLuminance("fff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
  });

  it("rejects malformed hex rather than guessing", () => {
    expect(() => relativeLuminance("#12345")).toThrow(/invalid hex/i);
  });
});

describe("contrastRatio", () => {
  it("returns 21 for black on white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
  });

  it("returns 1 for a colour against itself", () => {
    expect(contrastRatio("#39FF88", "#39FF88")).toBeCloseTo(1, 5);
  });

  it("is order-independent", () => {
    expect(contrastRatio("#05070A", "#C9D1D9")).toBeCloseTo(
      contrastRatio("#C9D1D9", "#05070A"),
      5,
    );
  });
});
