/**
 * Fetches articles from ABTC investors + news sites and upserts into DB.
 * Run on a schedule (e.g. Vercel Cron) or manually: npm run fetch-articles
 *
 * Requires: DATABASE_URL, optional GEMINI_API_KEY for AI summaries (fallback: no summary).
 */
import * as cheerio from "cheerio";
import { prisma } from "../lib/db";
import { ALL_TOPIC_SLUGS, type TopicSlug } from "../lib/categories";

const INVESTORS_BASE = "https://investors.americanbatterytechnology.com";
const NEWS_BASE = "https://americanbatterytechnology.com/news";

type RawItem = {
  title: string;
  url: string;
  date: string;
  source: "investors" | "news";
  section: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseDate(s: string): Date {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

/** Map section + title to a fixed topic slug (you can refine with keywords). */
function inferTopic(_section: string, title: string): TopicSlug {
  const t = title.toLowerCase();
  if (/\b(deal|partnership|approval|epa|agreement|collaboration|alliance)\b/.test(t)) return "deals";
  if (/\b(grant|funding|capital|government|doe|federal)\b/.test(t)) return "funding";
  if (/\b(project|facility|plant|production|operations)\b/.test(t)) return "operations";
  if (/\b(technology|r&d|research|battery|recycling)\b/.test(t)) return "technology";
  return "other";
}

async function fetchInvestors(): Promise<RawItem[]> {
  const out: RawItem[] = [];
  const res = await fetch(INVESTORS_BASE, { headers: { "User-Agent": "ABTC-StoryPostGenerator/1.0" } });
  if (!res.ok) return out;
  const html = await res.text();
  const $ = cheerio.load(html);

  // Adapt selectors to actual HTML; these are placeholders.
  $('a[href*="/press"], a[href*="/sec"], a[href*="/events"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href");
    const title = $el.text().trim();
    if (!href || !title) return;
    const url = href.startsWith("http") ? href : new URL(href, INVESTORS_BASE).href;
    let section = "press_releases";
    if (url.includes("sec") || url.includes("filing")) section = "sec_filings";
    else if (url.includes("event")) section = "events_presentation";
    out.push({
      title,
      url,
      date: new Date().toISOString().slice(0, 10),
      source: "investors",
      section,
    });
  });
  return out;
}

async function fetchNews(): Promise<RawItem[]> {
  const out: RawItem[] = [];
  const res = await fetch(NEWS_BASE, { headers: { "User-Agent": "ABTC-StoryPostGenerator/1.0" } });
  if (!res.ok) return out;
  const html = await res.text();
  const $ = cheerio.load(html);

  $('a[href*="/news/"]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr("href");
    const title = $el.text().trim();
    if (!href || !title || title.length < 5) return;
    const url = href.startsWith("http") ? href : new URL(href, NEWS_BASE).href;
    out.push({
      title,
      url,
      date: new Date().toISOString().slice(0, 10),
      source: "news",
      section: url.includes("news") ? "abtc_in_the_news" : "press_releases",
    });
  });
  return out;
}

export async function runFetch() {
  const [investorsItems, newsItems] = await Promise.all([fetchInvestors(), fetchNews()]);
  const all: RawItem[] = [...investorsItems, ...newsItems];

  for (const item of all) {
    const externalId = slugify(item.url) || `raw-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const topicSlug = inferTopic(item.section, item.title);
    const publishedAt = parseDate(item.date);

    await prisma.article.upsert({
      where: { externalId },
      create: {
        externalId,
        title: item.title,
        summary: null,
        url: item.url,
        source: item.source,
        section: item.section,
        topicSlug: ALL_TOPIC_SLUGS.includes(topicSlug) ? topicSlug : "other",
        publishedAt,
      },
      update: {
        title: item.title,
        url: item.url,
        section: item.section,
        topicSlug: ALL_TOPIC_SLUGS.includes(topicSlug) ? topicSlug : "other",
        publishedAt,
      },
    });
  }

  console.log(`Upserted ${all.length} articles.`);
}

async function main() {
  await runFetch();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
