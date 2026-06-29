/**
 * Client-side language options for selectors (mirrors the `languages` seed in
 * migration 0001). `code` is ISO-639-1, used as the STT language hint and the
 * TTS/prompt language identity.
 */
export interface LanguageOption {
  code: string;
  name: string;
  native: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { code: "ka", name: "Georgian", native: "ქართული", flag: "🇬🇪" },
];

export function languageName(code: string): string {
  return LANGUAGE_OPTIONS.find((l) => l.code === code)?.name ?? code;
}
