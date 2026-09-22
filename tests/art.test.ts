import { describe, expect, it } from "vitest";
import {
  ICOSAHEDRON,
  createRng,
  project,
  rotate,
  seedFrom,
} from "@/lib/art";

describe("seedFrom", () => {
  it("is deterministic for the same input", () => {
    expect(seedFrom("apex-it")).toBe(seedFrom("apex-it"));
  });

  it("separates inputs that differ by one character", () => {
    expect(seedFrom("apex-it")).not.toBe(seedFrom("apex-iu"));
  });

  it("returns a non-negative 32-bit integer", () => {
    const seed = seedFrom("potholio");
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThan(2 ** 32);
  });

  it("handles the empty string without throwing", () => {
    expect(() => seedFrom("")).not.toThrow();
  });
});

describe("createRng", () => {
  it("replays the identical sequence for the same seed", () => {
    const a = createRng(12345);
    const b = createRng(12345);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a()).not.toBe(b());
  });

  it("stays within [0, 1)", () => {
    const rand = createRng(seedFrom("fitfusion"));
    for (let i = 0; i < 200; i += 1) {
      const value = rand();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("ICOSAHEDRON", () => {
  it("has the 12 vertices and 30 edges of a regular icosahedron", () => {
    expect(ICOSAHEDRON.vertices).toHaveLength(12);
    expect(ICOSAHEDRON.edges).toHaveLength(30);
  });

  it("normalises every vertex onto the unit sphere", () => {
    for (const v of ICOSAHEDRON.vertices) {
      expect(Math.hypot(v.x, v.y, v.z)).toBeCloseTo(1, 10);
    }
  });

  it("lists every edge once, with in-range indices", () => {
    const seen = new Set<string>();
    for (const [a, b] of ICOSAHEDRON.edges) {
      expect(a).toBeLessThan(b);
      expect(b).toBeLessThan(ICOSAHEDRON.vertices.length);
      const key = `${a}-${b}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it("gives every edge the same length, which is what makes it regular", () => {
    const lengths = ICOSAHEDRON.edges.map(([a, b]) => {
      const p = ICOSAHEDRON.vertices[a];
      const q = ICOSAHEDRON.vertices[b];
      return Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);
    });
    for (const length of lengths) {
      expect(length).toBeCloseTo(lengths[0], 10);
    }
  });
});

describe("rotate", () => {
  it("returns the point unchanged at zero rotation", () => {
    const p = rotate({ x: 0.3, y: -0.4, z: 0.5 }, 0, 0);
    expect(p.x).toBeCloseTo(0.3, 10);
    expect(p.y).toBeCloseTo(-0.4, 10);
    expect(p.z).toBeCloseTo(0.5, 10);
  });

  it("preserves length, because a rotation cannot scale", () => {
    const start = { x: 0.3, y: -0.4, z: 0.5 };
    const before = Math.hypot(start.x, start.y, start.z);
    const after = rotate(start, 1.1, 2.3);
    expect(Math.hypot(after.x, after.y, after.z)).toBeCloseTo(before, 10);
  });

  it("returns to the start after a full turn on both axes", () => {
    const start = { x: 0.3, y: -0.4, z: 0.5 };
    const turned = rotate(start, Math.PI * 2, Math.PI * 2);
    expect(turned.x).toBeCloseTo(start.x, 8);
    expect(turned.y).toBeCloseTo(start.y, 8);
    expect(turned.z).toBeCloseTo(start.z, 8);
  });
});

describe("project", () => {
  const view = { cx: 100, cy: 50, radius: 40 };

  it("puts a centred point at the centre", () => {
    const p = project({ x: 0, y: 0, z: 0 }, view);
    expect(p.x).toBeCloseTo(100, 10);
    expect(p.y).toBeCloseTo(50, 10);
  });

  it("draws nearer points larger than farther ones", () => {
    const near = project({ x: 0, y: 0, z: -0.9 }, view);
    const far = project({ x: 0, y: 0, z: 0.9 }, view);
    expect(near.scale).toBeGreaterThan(far.scale);
  });

  it("pushes a nearer point further from centre than the same point far away", () => {
    const near = project({ x: 1, y: 0, z: -0.9 }, view);
    const far = project({ x: 1, y: 0, z: 0.9 }, view);
    expect(near.x - view.cx).toBeGreaterThan(far.x - view.cx);
  });

  it("keeps scale positive for every depth on the unit sphere", () => {
    for (let z = -1; z <= 1; z += 0.1) {
      expect(project({ x: 0, y: 0, z }, view).scale).toBeGreaterThan(0);
    }
  });
});
