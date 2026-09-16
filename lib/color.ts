/** WCAG 2.1 relative luminance and contrast, used to enforce the palette's AA floor. */

const HEX = /^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function toChannels(hex: string): [number, number, number] {
  if (!HEX.test(hex)) throw new Error(`invalid hex colour: ${hex}`);
  let body = hex.replace("#", "");
  if (body.length === 3) body = body.split("").map((c) => c + c).join("");
  return [
    parseInt(body.slice(0, 2), 16),
    parseInt(body.slice(2, 4), 16),
    parseInt(body.slice(4, 6), 16),
  ];
}

/** Linearises an 8-bit sRGB channel per WCAG 2.1. */
function linearise(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = toChannels(hex).map(linearise);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}
