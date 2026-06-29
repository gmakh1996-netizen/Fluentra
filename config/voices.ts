/**
 * Curated ElevenLabs voices offered in the voice tutor. IDs are ElevenLabs'
 * public preset voices; swap/extend freely. `eleven_multilingual_v2` (the TTS
 * model default) speaks all of Fluentra's languages with these voices.
 */
export interface Voice {
  id: string;
  name: string;
  gender: "female" | "male";
  accent: string;
  description: string;
}

export const VOICES: Voice[] = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", gender: "female", accent: "American", description: "Calm and clear" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", gender: "female", accent: "American", description: "Soft and friendly" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", gender: "female", accent: "British", description: "Warm and articulate" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", gender: "male", accent: "American", description: "Deep and steady" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", gender: "male", accent: "British", description: "Mature and engaging" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", gender: "male", accent: "British", description: "Crisp newsreader tone" },
];

export const DEFAULT_VOICE_ID = VOICES[0]!.id;

export const SPEED_OPTIONS = [
  { label: "0.75×", value: 0.75 },
  { label: "Normal", value: 1 },
  { label: "1.15×", value: 1.15 },
  { label: "1.3×", value: 1.3 },
] as const;
