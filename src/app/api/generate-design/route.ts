import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/db";
import { listDesignDataImages } from "@/lib/design-data";
import { GRADIENT_KEYS, IMAGE_PREFIX } from "@/lib/backgrounds";

export const dynamic = "force-dynamic";
const maxDuration = 60;

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set" },
      { status: 503 }
    );
  }

  let body: { articleId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { articleId } = body;
  if (!articleId) {
    return NextResponse.json(
      { error: "articleId is required" },
      { status: 400 }
    );
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
  });
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const [designImages] = await Promise.all([listDesignDataImages()]);
  const imageOptions = designImages.map((f) => `${IMAGE_PREFIX}${f}`);
  const allBackgroundOptions = [...GRADIENT_KEYS, ...imageOptions];

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const backgroundList = allBackgroundOptions.map((o) => `"${o}"`).join(", ");

  const prompt = `You are a professional social media designer for American Battery Technology Company (ABTC). The company uses teal and dark blue branding; the vibe is modern, clean, and suitable for investors and industry.

Given this article, produce a design spec for a single social/story image.

Article title: ${article.title}
Article summary: ${article.summary || "No summary provided."}

Respond with ONLY a valid JSON object (no markdown, no code block), with these exact keys:
- "displayTitle": string, 2 to 6 words max, punchy and professional, capturing the main highlight (e.g. "EPA Approval", "Nevada Lithium Deal")
- "displaySummary": string, one or two short sentences for the image (max ~120 chars), key takeaway only
- "backgroundStyle": string, exactly one of these options (copy the string exactly): ${backgroundList}

Choose a background that best fits the article's tone: use gradient options for a clean professional look, or use an image:... option for a more visual/key-art style. Pick one that feels professional yet appealing for social media.

Only output the JSON object.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/^```json?\s*|\s*```$/g, "").trim();
    const spec = JSON.parse(cleaned) as {
      displayTitle: string;
      displaySummary: string;
      backgroundStyle: string;
    };

    if (
      typeof spec.displayTitle !== "string" ||
      typeof spec.displaySummary !== "string" ||
      typeof spec.backgroundStyle !== "string"
    ) {
      throw new Error("Invalid spec shape");
    }

    const allowed = new Set(allBackgroundOptions);
    const backgroundStyle = allowed.has(spec.backgroundStyle)
      ? spec.backgroundStyle
      : GRADIENT_KEYS[0];

    return NextResponse.json({
      articleId: article.id,
      title: spec.displayTitle,
      summary: spec.displaySummary,
      backgroundStyle,
    });
  } catch (e) {
    console.error("Generate design error:", e);
    return NextResponse.json(
      { error: "Failed to generate design" },
      { status: 500 }
    );
  }
}
