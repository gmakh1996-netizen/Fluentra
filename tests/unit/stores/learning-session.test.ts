import { describe, it, expect, beforeEach } from "vitest";
import { useLearningSession } from "@/stores/learning-session";

describe("useLearningSession", () => {
  beforeEach(() => {
    useLearningSession.getState().reset();
  });

  it("starts with null languages", () => {
    const { targetLanguage, nativeLanguage } = useLearningSession.getState();
    expect(targetLanguage).toBeNull();
    expect(nativeLanguage).toBeNull();
  });

  it("starts with A1 level and casual mode", () => {
    const { level, mode } = useLearningSession.getState();
    expect(level).toBe("A1");
    expect(mode).toBe("casual");
  });

  it("starts with isRecording false", () => {
    expect(useLearningSession.getState().isRecording).toBe(false);
  });

  it("setLanguages updates both native and target", () => {
    useLearningSession.getState().setLanguages("Georgian", "English");
    const { nativeLanguage, targetLanguage } = useLearningSession.getState();
    expect(nativeLanguage).toBe("Georgian");
    expect(targetLanguage).toBe("English");
  });

  it("setLevel updates the level", () => {
    useLearningSession.getState().setLevel("C1");
    expect(useLearningSession.getState().level).toBe("C1");
  });

  it("setMode updates the mode", () => {
    useLearningSession.getState().setMode("business");
    expect(useLearningSession.getState().mode).toBe("business");
  });

  it("setRecording updates isRecording to true", () => {
    useLearningSession.getState().setRecording(true);
    expect(useLearningSession.getState().isRecording).toBe(true);
  });

  it("setRecording can toggle back to false", () => {
    useLearningSession.getState().setRecording(true);
    useLearningSession.getState().setRecording(false);
    expect(useLearningSession.getState().isRecording).toBe(false);
  });

  it("reset returns all fields to initial state", () => {
    const store = useLearningSession.getState();
    store.setLanguages("French", "Spanish");
    store.setLevel("C2");
    store.setMode("interview");
    store.setRecording(true);
    store.reset();

    const state = useLearningSession.getState();
    expect(state.nativeLanguage).toBeNull();
    expect(state.targetLanguage).toBeNull();
    expect(state.level).toBe("A1");
    expect(state.mode).toBe("casual");
    expect(state.isRecording).toBe(false);
  });

  it("changes are independent across calls", () => {
    useLearningSession.getState().setLevel("B2");
    useLearningSession.getState().setMode("grammar");
    const state = useLearningSession.getState();
    expect(state.level).toBe("B2");
    expect(state.mode).toBe("grammar");
    expect(state.targetLanguage).toBeNull();
  });
});
