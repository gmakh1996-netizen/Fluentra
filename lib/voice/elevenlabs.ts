import "server-only";
import { env } from "@/lib/env";
import { ApiError } from "@/lib/errors";

export interface TtsOptions {
  voiceId: string;
  modelId?: string;
  speed?: number; // 0.5–2.0
}

export interface SttOptions {
  /** ISO-639 hint (e.g. "en", "es"). Omit to let the model auto-detect. */
  languageCode?: string;
  modelId?: string;
}

export interface Transcript {
  text: string;
  language?: string;
}

export interface VoiceProvider {
  readonly name: string;
  /** Text → speech. Returns audio bytes (mp3). */
  synthesize(text: string, opts: TtsOptions): Promise<ArrayBuffer>;
  /** Speech → text. Accepts recorded audio bytes (any common container). */
  transcribe(audio: ArrayBuffer, mimeType: string, opts?: SttOptions): Promise<Transcript>;
}

class ElevenLabsProvider implements VoiceProvider {
  readonly name = "elevenlabs";

  private key(): string {
    if (!env.ELEVENLABS_API_KEY) {
      throw new ApiError("provider_not_configured", "Voice is not configured.", 501);
    }
    return env.ELEVENLABS_API_KEY;
  }

  async synthesize(text: string, opts: TtsOptions): Promise<ArrayBuffer> {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${opts.voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": this.key(),
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: opts.modelId ?? "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: opts.speed ?? 1 },
      }),
    });
    if (!res.ok) {
      throw new ApiError("internal_error", `TTS failed: ${res.status}`, 502);
    }
    return res.arrayBuffer();
  }

  async transcribe(audio: ArrayBuffer, mimeType: string, opts?: SttOptions): Promise<Transcript> {
    // ElevenLabs Scribe speech-to-text (multipart form).
    const form = new FormData();
    form.append("file", new Blob([audio], { type: mimeType || "audio/webm" }), "audio");
    form.append("model_id", opts?.modelId ?? "scribe_v1");
    if (opts?.languageCode) form.append("language_code", opts.languageCode);

    const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": this.key() }, // let fetch set the multipart boundary
      body: form,
    });
    if (!res.ok) {
      throw new ApiError("internal_error", `Speech recognition failed: ${res.status}`, 502);
    }
    const data = (await res.json()) as { text?: string; language_code?: string };
    return { text: (data.text ?? "").trim(), language: data.language_code };
  }
}

export function getVoiceProvider(): VoiceProvider {
  return new ElevenLabsProvider();
}
