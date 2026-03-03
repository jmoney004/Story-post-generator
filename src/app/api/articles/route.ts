import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ALL_SECTION_SLUGS, ALL_TOPIC_SLUGS } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter"); // "all" | section slug | topic slug
  const section = searchParams.get("section");
  const topic = searchParams.get("topic");

  try {
    const where: { section?: string; topicSlug?: string } = {};
    if (filter && filter !== "all") {
      if (ALL_SECTION_SLUGS.includes(filter as (typeof ALL_SECTION_SLUGS)[number])) {
        where.section = filter;
      } else if (ALL_TOPIC_SLUGS.includes(filter as (typeof ALL_TOPIC_SLUGS)[number])) {
        where.topicSlug = filter;
      }
    }
    if (section) where.section = section;
    if (topic) where.topicSlug = topic;

    const articles = await prisma.article.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        summary: true,
        url: true,
        section: true,
        topicSlug: true,
        publishedAt: true,
      },
    });
    return NextResponse.json(articles);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}
