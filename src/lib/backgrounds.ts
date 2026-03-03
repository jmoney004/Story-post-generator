/**
 * Gradient backgrounds (code-drawn) and prefix for image backgrounds.
 * Image backgrounds use backgroundStyle = "image:" + filename from Design Data.
 */

export const GRADIENT_BACKGROUNDS: Record<string, string[]> = {
  "teal-gradient": ["#0d9488", "#0f766e", "#134e4a"],
  "blue-gradient": ["#1e3a5f", "#0f172a", "#020617"],
  "teal-blue-split": ["#0d9488", "#1e3a5f"],
  "dark-blue-solid": ["#0f172a"],
  "light-teal-subtle": ["#ccfbf1", "#99f6e4", "#5eead4"],
  "teal-shine": ["#14b8a6", "#0d9488", "#0f766e"],
  "blue-depth": ["#1e3a5f", "#312e81", "#1e1b4b"],
  "slate-teal": ["#334155", "#0d9488", "#134e4a"],
  "energy-flow": ["#0f172a", "#0d9488", "#06b6d4"],
  "battery-modern": ["#0c4a6e", "#0d9488", "#115e59"],
  "investor-clean": ["#f8fafc", "#e2e8f0", "#94a3b8"],
  "accent-line": ["#0f172a", "#1e293b", "#0d9488"],
};

export const GRADIENT_KEYS = Object.keys(GRADIENT_BACKGROUNDS);

export const IMAGE_PREFIX = "image:";

export function isImageBackground(style: string): boolean {
  return style.startsWith(IMAGE_PREFIX);
}

export function getImageFilename(style: string): string | null {
  if (!isImageBackground(style)) return null;
  return style.slice(IMAGE_PREFIX.length).trim() || null;
}
