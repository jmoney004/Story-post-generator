// Section 1: source-based categories (from investors + news sites)
export const SECTION_1_CATEGORIES = [
  { slug: "press_releases", label: "Press Releases" },
  { slug: "news", label: "News" },
  { slug: "events_presentation", label: "Events & Presentation" },
  { slug: "sec_filings", label: "SEC Filings" },
  { slug: "abtc_in_the_news", label: "ABTC in the News" },
] as const;

export type Section1Slug = (typeof SECTION_1_CATEGORIES)[number]["slug"];

// Section 2: fixed topic-based categories (content type)
export const SECTION_2_TOPICS = [
  { slug: "deals", label: "Deals & Partnerships" },
  { slug: "funding", label: "Funding & Grants" },
  { slug: "operations", label: "Operations & Projects" },
  { slug: "technology", label: "Technology & R&D" },
  { slug: "other", label: "Other" },
] as const;

export type TopicSlug = (typeof SECTION_2_TOPICS)[number]["slug"];

export const ALL_TOPIC_SLUGS: TopicSlug[] = SECTION_2_TOPICS.map((t) => t.slug);
export const ALL_SECTION_SLUGS: Section1Slug[] = SECTION_1_CATEGORIES.map((c) => c.slug);

export function getSectionLabel(slug: string): string {
  return SECTION_1_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function getTopicLabel(slug: string): string {
  return SECTION_2_TOPICS.find((t) => t.slug === slug)?.label ?? slug;
}
