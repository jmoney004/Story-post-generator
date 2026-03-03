# Setup & run

## 1. Install and run the site (local)

```bash
cd "/Users/work/Story Post Generator"
npm install
cp .env.example .env
```

Edit `.env`: set `GEMINI_API_KEY` (get one at https://aistudio.google.com/app/apikey).  
`DATABASE_URL` can stay as `file:./dev.db` for local SQLite.

```bash
npm run db:generate
npm run db:push
npm run dev
```

Open **http://localhost:3000** (or double-click `index.html` and click “Open site (local)”).

---

## 2. Push to GitHub

Remote is already set to: `https://github.com/jmoney004/Story-post-generator.git`

In Terminal:

```bash
cd "/Users/work/Story Post Generator"
git push -u origin main
```

When asked for **password**, use a **Personal Access Token**, not your GitHub password:

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**  
2. **Generate new token** → enable **repo**  
3. Copy the token and paste it when `git push` asks for your password (username = `jmoney004`).

---

## 3. Deploy online (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import **jmoney004/Story-post-generator**.
2. **Environment variables:** add `DATABASE_URL` (e.g. from Vercel Postgres) and `GEMINI_API_KEY`.
3. For **Postgres**: in `prisma/schema.prisma` set `provider = "postgres"`, then deploy.
4. After deploy, copy your app URL (e.g. `https://story-post-generator-xxx.vercel.app`) and put it in `index.html` as the “Open site (online)” link so you can open the site from the launcher with one click.
