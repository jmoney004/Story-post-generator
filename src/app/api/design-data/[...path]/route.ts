import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { getDesignDataFilePath } from "@/lib/design-data";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filename = pathSegments.join("/");
  const decoded = decodeURIComponent(filename);
  const filePath = getDesignDataFilePath(decoded);
  if (!filePath) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }
  try {
    const buf = await readFile(filePath);
    const ext = path.extname(decoded).toLowerCase();
    const types: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    };
    const contentType = types[ext] || "application/octet-stream";
    return new NextResponse(buf, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=3600" },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
