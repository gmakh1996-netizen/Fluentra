import { describe, it, expect } from "vitest";
import { CEFR_LEVELS, CONVERSATION_MODES, chatMessageSchema } from "@/lib/ai/types";

describe("CEFR_LEVELS", () => {
  it("contains all 6 levels in correct order", () => {
    expect(CEFR_LEVELS).toEqual(["A1", "A2", "B1", "B2", "C1", "C2"]);
  });

  it("starts with A1 and ends with C2", () => {
    expect(CEFR_LEVELS[0]).toBe("A1");
    expect(CEFR_LEVELS[CEFR_LEVELS.length - 1]).toBe("C2");
  });
});

describe("CONVERSATION_MODES", () => {
  it("contains casual, business, travel, interview, pronunciation, grammar", () => {
    expect(CONVERSATION_MODES).toContain("casual");
    expect(CONVERSATION_MODES).toContain("business");
    expect(CONVERSATION_MODES).toContain("travel");
    expect(CONVERSATION_MODES).toContain("interview");
    expect(CONVERSATION_MODES).toContain("pronunciation");
    expect(CONVERSATION_MODES).toContain("grammar");
  });

  it("has exactly 6 modes", () => {
    expect(CONVERSATION_MODES.length).toBe(6);
  });
});

describe("chatMessageSchema", () => {
  it("accepts a user message", () => {
    expect(chatMessageSchema.safeParse({ role: "user", content: "Hello" }).success).toBe(true);
  });

  it("accepts an assistant message", () => {
    expect(chatMessageSchema.safeParse({ role: "assistant", content: "Hi!" }).success).toBe(true);
  });

  it("accepts a system message", () => {
    expect(chatMessageSchema.safeParse({ role: "system", content: "You are a tutor." }).success).toBe(true);
  });

  it("rejects empty content", () => {
    expect(chatMessageSchema.safeParse({ role: "user", content: "" }).success).toBe(false);
  });

  it("rejects invalid role", () => {
    expect(chatMessageSchema.safeParse({ role: "bot", content: "Hello" }).success).toBe(false);
  });

  it("rejects missing role", () => {
    expect(chatMessageSchema.safeParse({ content: "Hello" }).success).toBe(false);
  });

  it("rejects missing content", () => {
    expect(chatMessageSchema.safeParse({ role: "user" }).success).toBe(false);
  });
});
