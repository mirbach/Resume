/** Blends a hex colour toward white to produce a light pastel badge background. */
export function lightTint(hex: string, blend = 0.82): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const t = (c: number) => Math.round(c + (255 - c) * blend).toString(16).padStart(2, '0');
  return `#${t(r)}${t(g)}${t(b)}`;
}
