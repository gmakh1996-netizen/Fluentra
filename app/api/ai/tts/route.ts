import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) return user;
  }
  return requireUser();
}

export async function POST(req: Request) {
  try {
    await getUserFromRequest(req);

    const { text, voice = "nova" } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "No text" }, { status: 400 });

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: text.slice(0, 1000),
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    const base64 = buffer.toString("base64");

    return NextResponse.json({ audio: base64 });
  } catch {
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
