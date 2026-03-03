"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  SECTION_1_CATEGORIES,
  SECTION_2_TOPICS,
  getSectionLabel,
  getTopicLabel,
} from "@/lib/categories";
import { format } from "date-fns";

type Article = {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  section: string;
  topicSlug: string;
  publishedAt: string;
};

type Filter = "all" | string;

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async (f: Filter) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f && f !== "all") params.set("filter", f);
    const res = await fetch(`/api/articles?${params}`);
    if (res.ok) {
      const data = await res.json();
      setArticles(data);
    } else setArticles([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles(filter);
  }, [filter, fetchArticles]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center gap-4">
            <img
              src="/abtc-logo.png"
              alt="ABTC"
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-semibold text-abtc-blue-dark">
                Story Post Generator
              </h1>
              <p className="text-sm text-slate-500">
                News, press releases & social assets
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
            All
          </h2>
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 text-left font-medium transition ${
              filter === "all"
                ? "bg-abtc-teal text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All articles (latest first)
          </button>
        </section>

        <div className="grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
              By source
            </h2>
            <div className="flex flex-wrap gap-2">
              {SECTION_1_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setFilter(cat.slug)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === cat.slug
                      ? "bg-abtc-teal text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-abtc-teal hover:text-abtc-teal"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
              By topic
            </h2>
            <div className="flex flex-wrap gap-2">
              {SECTION_2_TOPICS.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => setFilter(t.slug)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === t.slug
                      ? "bg-abtc-teal text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-abtc-teal hover:text-abtc-teal"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-abtc-blue-dark">
            {filter === "all"
              ? "All articles"
              : getSectionLabel(filter) || getTopicLabel(filter) || filter}
          </h2>
          {loading ? (
            <p className="text-slate-500">Loading…</p>
          ) : articles.length === 0 ? (
            <p className="text-slate-500">
              No articles yet. Run the fetcher to populate the database.
            </p>
          ) : (
            <ul className="space-y-4">
              {articles.map((a) => (
                <li key={a.id} className="card flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-abtc-teal underline decoration-abtc-teal/40 underline-offset-2 hover:decoration-abtc-teal"
                    >
                      {a.title}
                    </a>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                      {a.summary || "No summary available."}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {format(new Date(a.publishedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Link
                    href={`/editor?articleId=${a.id}`}
                    className="btn-primary shrink-0 text-center text-sm"
                  >
                    Generate Image
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
