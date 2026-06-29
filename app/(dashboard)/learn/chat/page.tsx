import type { Metadata } from "next";
import type { Message } from "ai";
import { requireUserPage } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/chat/chat-interface";

export const metadata: Metadata = { title: "AI Tutor Chat" };

export default async function ChatPage() {
  const { user } = await requireUserPage();
  const supabase = await createClient();

  // Load last 50 messages as conversation history.
  // ai_messages table arrives in migration 0003 — silently skip if missing.
  let initialMessages: Message[] = [];
  try {
    const { data } = await supabase
      .from("ai_messages" as never)
      .select("id, role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (data) {
      initialMessages = (data as Array<{ id: string; role: string; content: string }>)
        .filter((r) => r.role === "user" || r.role === "assistant")
        .map((r) => ({ id: r.id, role: r.role as "user" | "assistant", content: r.content }));
    }
  } catch {
    // Table not yet migrated — start with empty history
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">AI Tutor</h1>
        <p className="mt-1 text-muted-foreground">
          Chat with your personal language tutor. Select text to translate or explain, check your
          grammar, or use your voice.
        </p>
      </div>
      <ChatInterface initialMessages={initialMessages} />
    </div>
  );
}
