import type { Metadata } from "next";
import { VoiceConversation } from "@/components/voice/voice-conversation";

export const metadata: Metadata = { title: "Voice tutor" };

export default function VoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Voice conversation</h1>
        <p className="mt-1 text-muted-foreground">
          Speak naturally with your AI tutor — it transcribes your speech, replies aloud, and scores
          your pronunciation in real time.
        </p>
      </div>
      <VoiceConversation />
    </div>
  );
}
