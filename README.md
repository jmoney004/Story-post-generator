# ABTC Story Post Generator

A Next.js app for **American Battery Technology Company** that aggregates news and press releases, organizes them by source and topic, and generates social/story images for sharing.

## Features

- **All** view: every article, sorted by publish date (latest first)
- **Section 1 (by source):** Press Releases, News, Events & Presentation, SEC Filings, ABTC in the News
- **Section 2 (by topic):** Deals & Partnerships, Funding & Grants, Operations & Projects, Technology & R&D, Other
- **Article list:** title (links to ABTC site), short summary, **Generate Image** button
- **Image editor:** Gemini-powered design (title + summary + ABTC-branded background), canvas preview, download PNG, AI chat for edit suggestions (placeholder for full in-browser editing later)
- **Design Data:** folder for reference assets so generated images match your preferred style
- **Scheduled fetch:** run article scraper on a schedule and store in DB

## Setup

**Quick steps:** see **[SETUP.md](./SETUP.md)** for install, run, GitHub push, and Vercel deploy.

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and set:

- **`DATABASE_URL`**  
  - Local: `file:./dev.db` (SQLite, create `prisma/dev.db` or run `npx prisma db push` to create it)  
  - Vercel: set in project settings to your **Vercel Postgres** (or other) connection string.
- **`GEMINI_API_KEY`**  
  Required for “Generate Image”. Get a key at [Google AI Studio](https://aistudio.google.com/app/apikey). Do not commit this key.

### 3. Database

```bash
npx prisma generate
npx prisma db push
```

For **Vercel Postgres**: in `prisma/schema.prisma` set `provider = "postgres"` and `url = env("DATABASE_URL")`, then run `npx prisma db push` (e.g. locally with Vercel Postgres URL in `.env`) or apply migrations via Vercel’s DB dashboard.

### 4. Populate articles (optional)

Run the fetcher once or on a schedule:

```bash
npm run fetch-articles
```

This scrapes the investors and news sites and upserts into the DB. You may need to adjust selectors in `src/scripts/fetch-articles.ts` to match the current HTML.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push the repo and import the project in Vercel.
2. Add env vars: `DATABASE_URL` (e.g. Vercel Postgres), `GEMINI_API_KEY`.
3. (Optional) **Scheduled article fetch:** `vercel.json` configures a daily cron (6:00 UTC) that calls `/api/cron/fetch`. Set `CRON_SECRET` in Vercel env; the route expects `Authorization: Bearer <CRON_SECRET>`.

## Logo

- Logo file: `public/abtc-logo.png` (included; white background).
- For a transparent logo on generated images: replace with a PNG that has transparency, or add a step (e.g. script or design tool) to remove the white background and save as `public/abtc-logo.png`.

## Design Data

Put reference designs and backgrounds in the **Design Data** folder (see `Design Data/README.md`). The generator uses ABTC’s teal/blue palette by default; you can extend the app to read from this folder for more custom styles.

## Tech stack

- **Next.js 15** (App Router), **TypeScript**, **Tailwind**
- **Prisma** (SQLite for local dev; Postgres on Vercel)
- **Gemini** (design spec for story images)
- **Canvas API** (render and download PNG; optional Fabric.js later for drag/resize editing)
