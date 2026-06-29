import { describe, it, expect } from "vitest";
import {
  buildTutorSystemPrompt,
  buildVoiceTutorSystemPrompt,
  GRAMMAR_SYSTEM_PROMPT,
  WRITING_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import type { LearningContext } from "@/lib/ai/types";

const ctx = (overrides: Partial<LearningContext> = {}): LearningContext => ({
  nativeLanguage: "Georgian",
  targetLanguage: "English",
  level: "B1",
  mode: "casual",
  ...overrides,
});

describe("buildTutorSystemPrompt", () => {
  it("mentions Fluentra as the tutor name", () => {
    expect(buildTutorSystemPrompt(ctx())).toContain("Fluentra");
  });

  it("includes native and target languages", () => {
    const prompt = buildTutorSystemPrompt(ctx({ nativeLanguage: "Spanish", targetLanguage: "French" }));
    expect(prompt).toContain("Spanish");
    expect(prompt).toContain("French");
  });

  it("includes the CEFR level", () => {
    expect(buildTutorSystemPrompt(ctx({ level: "C1" }))).toContain("C1");
  });

  it("includes A1 level guidance about simple words", () => {
    const prompt = buildTutorSystemPrompt(ctx({ level: "A1" }));
    expect(prompt).toContain("very simple");
  });

  it("includes B1 level guidance about everyday vocabulary", () => {
    const prompt = buildTutorSystemPrompt(ctx({ level: "B1" }));
    expect(prompt).toContain("everyday");
  });

  it("includes C2 level guidance about native peer", () => {
    const prompt = buildTutorSystemPrompt(ctx({ level: "C2" }));
    expect(prompt).toContain("native");
  });

  it("includes business mode guidance", () => {
    const prompt = buildTutorSystemPrompt(ctx({ mode: "business" }));
    expect(prompt).toContain("professional");
  });

  it("includes travel mode guidance", () => {
    const prompt = buildTutorSystemPrompt(ctx({ mode: "travel" }));
    expect(prompt).toContain("travel");
  });

  it("returns a non-empty string", () => {
    expect(buildTutorSystemPrompt(ctx()).length).toBeGreaterThan(100);
  });
});

describe("buildVoiceTutorSystemPrompt", () => {
  it("includes spoken conversation marker", () => {
    expect(buildVoiceTutorSystemPrompt(ctx())).toContain("SPOKEN");
  });

  it("explicitly forbids markdown", () => {
    expect(buildVoiceTutorSystemPrompt(ctx())).toContain("markdown");
  });

  it("is longer than the base prompt", () => {
    const base = buildTutorSystemPrompt(ctx());
    const voice = buildVoiceTutorSystemPrompt(ctx());
    expect(voice.length).toBeGreaterThan(base.length);
  });
});

describe("GRAMMAR_SYSTEM_PROMPT", () => {
  it("includes both languages", () => {
    const prompt = GRAMMAR_SYSTEM_PROMPT("English", "Georgian");
    expect(prompt).toContain("English");
    expect(prompt).toContain("Georgian");
  });

  it("mentions corrected sentence and mistakes", () => {
    const prompt = GRAMMAR_SYSTEM_PROMPT("French", "English");
    expect(prompt).toContain("corrected");
    expect(prompt).toContain("mistakes");
  });
});

describe("WRITING_SYSTEM_PROMPT", () => {
  it("includes the target language", () => {
    expect(WRITING_SYSTEM_PROMPT("German")).toContain("German");
  });

  it("mentions corrected text and suggestions", () => {
    const prompt = WRITING_SYSTEM_PROMPT("Italian");
    expect(prompt).toContain("corrected");
    expect(prompt).toContain("suggestions");
  });
});
