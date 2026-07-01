import { requireUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

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

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return Response.json({ error: "No audio file" }, { status: 400 });
    }

    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, "recording.m4a");
    whisperForm.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: whisperForm,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    return Response.json({ text: data.text });
  } catch (err) {
    return toErrorResponse(err);
  }
}
