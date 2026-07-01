import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const BUCKET = "unit-images";

const STYLE =
  "Flat design cartoon illustration for a language learning mobile app. " +
  "Style: Duolingo-inspired, 2D vector art, vibrant pastel colors, bold outlines, " +
  "simple geometric shapes, cute and friendly, no text, no letters, clean white background, " +
  "centered composition. Subject: ";

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic") ?? "learning";
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filename = `${slug}.jpg`;

  const admin = createAdminClient();

  // Ensure bucket exists (public)
  try {
    await admin.storage.createBucket(BUCKET, { public: true });
  } catch { /* already exists */ }

  // Check if image already stored
  const { data: listed } = await admin.storage.from(BUCKET).list("", { search: filename });
  if (listed && listed.length > 0) {
    const { data } = admin.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  }

  // Generate with DALL-E 3
  try {
    const result = await openai.images.generate({
      model: "dall-e-3",
      prompt: STYLE + topic + " themed scene for a language learning lesson",
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
      n: 1,
    });

    const dalleUrl = result.data[0]?.url;
    if (!dalleUrl) throw new Error("No URL");

    // Download and re-upload to Supabase (permanent storage)
    const imgRes = await fetch(dalleUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    await admin.storage.from(BUCKET).upload(filename, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

    const { data } = admin.storage.from(BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    console.error("[unit-image]", e);
    return NextResponse.json({ url: null }, { status: 500 });
  }
}
