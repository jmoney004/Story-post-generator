"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  GRADIENT_BACKGROUNDS,
  isImageBackground,
  getImageFilename,
} from "@/lib/backgrounds";

const CANVAS_W = 1080;
const CANVAS_H = 1080;

/** Returns a canvas with the image drawn and white/near-white pixels made transparent. */
function makeWhiteTransparent(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const threshold = 248; // pixels with R,G,B all above this become transparent
  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i];
    const g = data.data[i + 1];
    const b = data.data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data.data[i + 3] = 0;
    }
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

type Article = {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  publishedAt: string;
};

type DesignSpec = {
  title: string;
  summary: string;
  backgroundStyle: string;
};

export default function EditorPage() {
  const [article, setArticle] = useState<Article | null>(null);
  const [spec, setSpec] = useState<DesignSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLCanvasElement | null>(null);
  const [logoReady, setLogoReady] = useState(false);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const [backgroundImageReady, setBackgroundImageReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/abtc-logo.png";
    img.onload = () => {
      logoRef.current = makeWhiteTransparent(img);
      setLogoReady(true);
    };
    return () => {
      logoRef.current = null;
    };
  }, []);

  useEffect(() => {
    const filename =
      spec && spec.backgroundStyle ? getImageFilename(spec.backgroundStyle) : null;
    if (!filename) {
      backgroundImageRef.current = null;
      setBackgroundImageReady(false);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `/api/design-data/${encodeURIComponent(filename)}`;
    img.onload = () => {
      backgroundImageRef.current = img;
      setBackgroundImageReady(true);
    };
    img.onerror = () => {
      backgroundImageRef.current = null;
      setBackgroundImageReady(false);
    };
    return () => {
      backgroundImageRef.current = null;
    };
  }, [spec?.backgroundStyle]);

  const searchParams = typeof window !== "undefined" ? new URL(window.location.search).get("articleId") : null;
  const articleId = searchParams || "";

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      return;
    }
    fetch(`/api/articles/${articleId}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setArticle)
      .finally(() => setLoading(false));
  }, [articleId]);

  const drawCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, s: DesignSpec) => {
      const w = CANVAS_W;
      const h = CANVAS_H;
      ctx.clearRect(0, 0, w, h);

      if (isImageBackground(s.backgroundStyle)) {
        const bgImg = backgroundImageRef.current;
        if (bgImg?.complete && bgImg.naturalWidth) {
          const scale = Math.max(w / bgImg.naturalWidth, h / bgImg.naturalHeight);
          const sw = bgImg.naturalWidth;
          const sh = bgImg.naturalHeight;
          const sx = (sw - w / scale) / 2;
          const sy = (sh - h / scale) / 2;
          ctx.drawImage(bgImg, sx, sy, w / scale, h / scale, 0, 0, w, h);
        } else {
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(0, 0, w, h);
        }
      } else {
        const colors = GRADIENT_BACKGROUNDS[s.backgroundStyle] ?? GRADIENT_BACKGROUNDS["teal-gradient"];
        if (colors.length >= 2) {
          const g = ctx.createLinearGradient(0, 0, w, h);
          colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
          ctx.fillStyle = g;
        } else {
          ctx.fillStyle = colors[0];
        }
        ctx.fillRect(0, 0, w, h);
      }

      const logoCanvas = logoRef.current;
      if (logoCanvas?.width) {
        const pad = 48;
        const logoW = 220;
        const logoH = (logoCanvas.height / logoCanvas.width) * logoW;
        ctx.drawImage(logoCanvas, w - logoW - pad, pad, logoW, logoH);
      }

      const isDark =
        isImageBackground(s.backgroundStyle) ||
        ["blue-gradient", "dark-blue-solid", "teal-gradient", "teal-shine", "blue-depth", "slate-teal", "energy-flow", "battery-modern", "accent-line"].includes(s.backgroundStyle);
      ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
      ctx.textAlign = "center";

      ctx.font = "bold 72px system-ui, sans-serif";
      const titleLines = wrapText(ctx, s.title, w * 0.8);
      let y = h * 0.38;
      titleLines.forEach((line) => {
        ctx.fillText(line, w / 2, y);
        y += 88;
      });

      ctx.font = "28px system-ui, sans-serif";
      const summaryLines = wrapText(ctx, s.summary, w * 0.75);
      y += 24;
      summaryLines.forEach((line) => {
        ctx.fillText(line, w / 2, y);
        y += 36;
      });
    },
    []
  );

  useEffect(() => {
    if (!spec || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) drawCanvas(ctx, spec);
  }, [spec, drawCanvas, logoReady, backgroundImageReady]);

  const handleGenerate = useCallback(() => {
    if (!articleId) return;
    setGenerating(true);
    fetch("/api/generate-design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Generate failed"))))
      .then((data) =>
        setSpec({
          title: data.title,
          summary: data.summary,
          backgroundStyle: data.backgroundStyle,
        })
      )
      .catch(() => setSpec(null))
      .finally(() => setGenerating(false));
  }, [articleId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading article…</p>
      </div>
    );
  }
  if (!articleId || !article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-slate-600">No article selected.</p>
        <Link href="/" className="btn-primary">
          Back to articles
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link href="/" className="text-abtc-teal hover:underline">
          ← Back
        </Link>
        <h1 className="text-lg font-semibold text-abtc-blue-dark">Image editor</h1>
        <div className="w-16" />
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 p-4 md:grid-cols-[1fr,320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary disabled:opacity-50"
            >
              {generating ? "Generating…" : "Generate image"}
            </button>
            {spec && (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  canvasRef.current?.toBlob((blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `abtc-story-${article.id.slice(0, 8)}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                  });
                }}
                className="btn-secondary"
              >
                Download PNG
              </a>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="max-h-[70vmin] w-full object-contain"
              style={{ width: "100%", height: "auto", maxHeight: "70vmin" }}
            />
          </div>
          <p className="text-sm text-slate-500">
            Article: <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-abtc-teal underline">{article.title}</a>
          </p>
        </div>

        <aside className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-medium text-abtc-blue-dark">AI assistant</h2>
          <p className="mb-3 text-xs text-slate-500">
            Ask for edits (e.g. “larger title”, “darker background”). Full canvas editing coming soon.
          </p>
          <div className="mb-3 flex-1 overflow-y-auto rounded border border-slate-100 bg-slate-50 p-2 text-sm min-h-[120px]">
            {chatHistory.length === 0 ? (
              <p className="text-slate-400">No messages yet.</p>
            ) : (
              chatHistory.map((m, i) => (
                <div key={i} className={`mb-2 ${m.role === "user" ? "text-right" : ""}`}>
                  <span className={m.role === "user" ? "text-abtc-teal" : "text-slate-600"}>{m.text}</span>
                </div>
              ))
            )}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!chatMessage.trim()) return;
              setChatHistory((h) => [...h, { role: "user", text: chatMessage }]);
              setChatMessage("");
              setChatHistory((h) => [
                ...h,
                { role: "assistant", text: "Edit suggestions will be applied in a future update. You can download the image and adjust in your preferred tool for now." },
              ]);
            }}
          >
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Suggest an edit…"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-abtc-teal focus:outline-none focus:ring-1 focus:ring-abtc-teal"
            />
            <button type="submit" className="btn-primary text-sm">Send</button>
          </form>
        </aside>
      </main>
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const m = ctx.measureText(test);
    if (m.width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
