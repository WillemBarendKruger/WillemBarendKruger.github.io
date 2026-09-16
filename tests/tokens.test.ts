import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/color";

const css = readFileSync("app/globals.css", "utf8");

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,6})`));
  if (!match) throw new Error(`token --color-${name} not found in globals.css`);
  return match[1];
}

describe("design tokens", () => {
  it("defines every token the design system requires", () => {
    for (const name of ["bg", "panel", "green", "cyan", "purple", "text", "muted", "hairline"]) {
      expect(() => token(name)).not.toThrow();
    }
  });

  // WCAG AA: 4.5:1 for normal text.
  it.each([
    ["text", "bg"],
    ["text", "panel"],
    ["muted", "bg"],
    ["muted", "panel"],
    ["cyan", "bg"],
    ["green", "bg"],
    ["purple", "bg"],
    ["purple", "panel"],
  ])("%s on %s meets AA for body text", (fg, bg) => {
    expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps hairline out of text duty by documenting it fails AA", () => {
    // Guards intent: if someone lightens hairline enough to pass, they should
    // promote it to a text token deliberately rather than by accident.
    expect(contrastRatio(token("hairline"), token("bg"))).toBeLessThan(4.5);
  });
});
