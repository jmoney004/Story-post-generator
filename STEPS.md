# Step-by-step: What to do and why

---

## Part 1: Run the site on your computer

### Step 1.1 — Open Terminal and go to the project folder

**What to do:** Open the **Terminal** app on your Mac. Type this and press Enter:

```text
cd "/Users/work/Story Post Generator"
```

**Why:** So every command you run is inside your project folder.

---

### Step 1.2 — Install the project’s code (dependencies)

**What to do:** In the same Terminal window, run:

```text
npm install
```

Wait until it finishes (can take 1–2 minutes).

**Why:** The app needs hundreds of small code packages (Next.js, Prisma, etc.). This downloads them into a `node_modules` folder. Without this, commands like `next` or `prisma` don’t exist.

---

### Step 1.3 — Create your local settings file

**What to do:** Run:

```text
cp .env.example .env
```

**Why:** The app needs a file named `.env` with your secret settings (database path, API key). This copies the example file to `.env`. You’ll edit `.env` in the next step.

---

### Step 1.4 — Add your Gemini API key

**What to do:**

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with Google and create an API key. Copy it.
3. Open the file **`.env`** in your project (in Cursor or any editor).
4. Find the line: `GEMINI_API_KEY=""`
5. Paste your key between the quotes: `GEMINI_API_KEY="your-key-here"`
6. Save the file.

**Why:** “Generate Image” uses Google’s Gemini to create the title and layout. Without this key, that feature won’t work. The key is only in your `.env` file, which is not pushed to GitHub.

---

### Step 1.5 — Set up the database

**What to do:** In Terminal, run these two commands, one after the other:

```text
npm run db:generate
```

Wait for it to finish, then:

```text
npm run db:push
```

**Why:**

- **db:generate** — Builds the code that talks to the database (articles, etc.).
- **db:push** — Creates the actual database file (`prisma/dev.db`) and its tables. The app needs this to store and load articles.

---

### Step 1.6 — Start the site

**What to do:** Run:

```text
npm run dev
```

You should see something like: **“Ready on http://localhost:3000”**.

**Why:** This starts the app as a small server on your computer. “localhost:3000” means “this app, on this machine.”

---

### Step 1.7 — Open the site in your browser

**What to do:** Open your web browser and go to:

```text
http://localhost:3000
```

Or: double‑click **index.html** in your project folder, then click **“Open site (local)”**.

**Why:** The app only runs while the server is running. The browser is where you see the articles and use “Generate Image.”

---

**Summary Part 1:**  
Terminal: `cd` → `npm install` → `cp .env.example .env` → edit `.env` (add Gemini key) → `npm run db:generate` → `npm run db:push` → `npm run dev`. Then open **http://localhost:3000** in the browser.

---

## Part 2: Put your code on GitHub (optional)

You do this if you want to back up the code or deploy it online later.

### Step 2.1 — Create a Personal Access Token on GitHub

**What to do:**

1. Go to **https://github.com** and sign in.
2. Click your profile picture (top right) → **Settings**.
3. Left sidebar, bottom: **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
4. Click **Generate new token (classic)**.
5. Name it something like “Story Post Generator.” Check the **repo** box.
6. Click **Generate token**. Copy the token (you won’t see it again).

**Why:** GitHub no longer accepts your account password for `git push` from the command line. You must use a token instead.

---

### Step 2.2 — Push your code to GitHub

**What to do:** In Terminal (same project folder), run:

```text
git push -u origin main
```

When it asks:

- **Username:** type your GitHub username (e.g. `jmoney004`) and press Enter.
- **Password:** paste the **token** you copied (not your GitHub password) and press Enter.

**Why:** Your project is already a git repo with a first commit and the remote set to `https://github.com/jmoney004/Story-post-generator.git`. This command sends your code to that repo. After this, your code is on GitHub.

---

**Summary Part 2:**  
Create a token on GitHub (Settings → Developer settings → Personal access tokens), then run `git push -u origin main` and use your username + token when asked.

---

## Part 3: Put the site online (optional)

You do this if you want to open the site from any device without running `npm run dev` on your computer.

### Step 3.1 — Deploy on Vercel

**What to do:**

1. Go to **https://vercel.com** and sign in (e.g. with GitHub).
2. Click **Add New** → **Project**.
3. Import the repo **jmoney004/Story-post-generator** (after you’ve pushed in Part 2).
4. Before deploying, add **Environment Variables:**
   - **DATABASE_URL** — For a quick start you can leave this blank and add it later, or create a “Vercel Postgres” database in the Vercel dashboard and paste its URL.
   - **GEMINI_API_KEY** — Paste the same key you put in `.env`.
5. Click **Deploy**.

**Why:** Vercel runs your app on their servers and gives you a URL like `https://story-post-generator-xxxx.vercel.app`. That way the site is always on, and you don’t need to run `npm run dev` yourself.

---

### Step 3.2 — Use the online link from index.html

**What to do:** After deploy, Vercel shows your app URL. Copy it. Open **index.html** in your project, find the “Open site (online)” button, and change its link to your Vercel URL. Save.

**Why:** Then you can double‑click **index.html** and click “Open site (online)” to open the live site with one click.

---

**Summary Part 3:**  
Sign in to Vercel → Import your GitHub repo → Add `GEMINI_API_KEY` (and optionally `DATABASE_URL`) → Deploy → Put the Vercel URL in **index.html** for the “Open site (online)” button.

---

## Quick reference

| Goal                         | Do this |
|-----------------------------|--------|
| Run the site on my Mac      | Part 1 (Steps 1.1–1.7) |
| Put code on GitHub          | Part 2 (Steps 2.1–2.2) |
| Have a link that works anytime | Part 3 (Steps 3.1–3.2) |

If something in a step fails (e.g. “command not found” or “Cannot find module”), say which step and the exact message, and we can fix it.
