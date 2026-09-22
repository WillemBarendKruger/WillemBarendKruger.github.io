/**
 * Shared maths for the site's generated artwork: deterministic seeding, and
 * the small amount of 3D needed to draw a wireframe solid on a 2D canvas.
 *
 * Seeding is deterministic on purpose. A project's artwork is derived from its
 * slug, so it looks the same on every build and every visit — art that
 * reshuffled on each load would read as noise rather than as the project's own
 * mark.
 */

export type Vec3 = { x: number; y: number; z: number };

/** FNV-1a. Small, fast, and good enough to spread adjacent slugs apart. */
export function seedFrom(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 — a compact seeded PRNG with a long enough period for artwork. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildIcosahedron(): { vertices: Vec3[]; edges: [number, number][] } {
  const phi = (1 + Math.sqrt(5)) / 2;

  // The twelve vertices of a regular icosahedron are the cyclic permutations
  // of (0, ±1, ±phi), normalised onto the unit sphere.
  const raw: [number, number, number][] = [
    [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
    [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
    [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1],
  ];

  const vertices: Vec3[] = raw.map(([x, y, z]) => {
    const length = Math.hypot(x, y, z);
    return { x: x / length, y: y / length, z: z / length };
  });

  // Every pair separated by the minimum distance is an edge. On a regular
  // solid that yields exactly the 30 edges, with no arbitrary edge table.
  let min = Infinity;
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      const d = distance(vertices[i], vertices[j]);
      if (d < min) min = d;
    }
  }

  const edges: [number, number][] = [];
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      if (distance(vertices[i], vertices[j]) < min * 1.05) edges.push([i, j]);
    }
  }

  return { vertices, edges };
}

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export const ICOSAHEDRON = buildIcosahedron();

/** Rotate about the X axis then the Y axis. Order is fixed so callers animate
 *  two angles and always get the same tumble. */
export function rotate(point: Vec3, angleX: number, angleY: number): Vec3 {
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  const y1 = point.y * cosX - point.z * sinX;
  const z1 = point.y * sinX + point.z * cosX;

  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const x2 = point.x * cosY + z1 * sinY;
  const z2 = -point.x * sinY + z1 * cosY;

  return { x: x2, y: y1, z: z2 };
}

export type View = { cx: number; cy: number; radius: number };
export type Projected = { x: number; y: number; z: number; scale: number };

/**
 * Weak perspective projection. The camera sits at z = -CAMERA, so a smaller z
 * (nearer the viewer) yields a larger scale. CAMERA is comfortably outside the
 * unit sphere, which keeps the divisor positive for every point on it — the
 * `scale` is therefore always finite and positive.
 */
const CAMERA = 2.6;

export function project(point: Vec3, view: View): Projected {
  const scale = CAMERA / (CAMERA + point.z);
  return {
    x: view.cx + point.x * view.radius * scale,
    y: view.cy + point.y * view.radius * scale,
    z: point.z,
    scale,
  };
}

/** 0 for the farthest point on the unit sphere, 1 for the nearest. Used to
 *  drive line weight and alpha so depth reads without any lighting model. */
export function depthMix(z: number): number {
  return 1 - (Math.max(-1, Math.min(1, z)) + 1) / 2;
}
