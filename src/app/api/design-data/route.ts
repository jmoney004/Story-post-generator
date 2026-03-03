import { NextResponse } from "next/server";
import { listDesignDataImages } from "@/lib/design-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const images = await listDesignDataImages();
    return NextResponse.json({ images });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list design data" }, { status: 500 });
  }
}
