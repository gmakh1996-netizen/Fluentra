"use client";

import * as React from "react";

export interface Recording {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

type RecorderError = "unsupported" | "permission" | "no-device" | "failed";

const PREFERRED_MIME = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return PREFERRED_MIME.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

/**
 * Microphone recording with a live input level (0–1) for waveform UIs.
 * `start()` requests mic permission and begins capturing; `stop()` resolves
 * with the recorded blob + duration. All audio resources are released on stop
 * and on unmount. Real-time level is sampled from a Web Audio AnalyserNode.
 */
export function useMediaRecorder() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [level, setLevel] = React.useState(0);
  const [error, setError] = React.useState<RecorderError | null>(null);

  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const startedAtRef = React.useRef(0);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const cleanup = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setLevel(0);
  }, []);

  React.useEffect(() => cleanup, [cleanup]);

  const start = React.useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("unsupported");
      return false;
    }
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      // Level metering via AnalyserNode (RMS of the time-domain signal).
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const buffer = new Uint8Array(analyser.fftSize);

      const tick = () => {
        analyser.getByteTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          const v = (buffer[i]! - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buffer.length);
        setLevel(Math.min(1, rms * 2.2)); // scale for a livelier meter
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start();
      setIsRecording(true);
      return true;
    } catch (e) {
      const name = (e as DOMException)?.name;
      setError(name === "NotAllowedError" ? "permission" : name === "NotFoundError" ? "no-device" : "failed");
      cleanup();
      return false;
    }
  }, [isSupported, cleanup]);

  const stop = React.useCallback((): Promise<Recording | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      cleanup();
      setIsRecording(false);
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const durationMs = Date.now() - startedAtRef.current;
        cleanup();
        setIsRecording(false);
        resolve(blob.size > 0 ? { blob, mimeType, durationMs } : null);
      };
      recorder.stop();
    });
  }, [cleanup]);

  return { isSupported, isRecording, level, error, start, stop };
}
