import { readdir } from "fs/promises";
import path from "path";

const DESIGN_DATA_DIR = path.join(process.cwd(), "Design Data");
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export async function listDesignDataImages(): Promise<string[]> {
  const names = await readdir(DESIGN_DATA_DIR);
  return names.filter((n) => IMAGE_EXT.has(path.extname(n).toLowerCase()));
}

export function getDesignDataFilePath(filename: string): string | null {
  const base = path.basename(filename.replace(/\/+/g, "/"));
  if (base.includes("..") || path.isAbsolute(filename)) return null;
  const ext = path.extname(base).toLowerCase();
  if (!IMAGE_EXT.has(ext)) return null;
  return path.join(DESIGN_DATA_DIR, base);
}
