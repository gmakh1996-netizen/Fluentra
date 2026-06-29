import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toErrorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("languages")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({ db: "ok", count: count ?? 0 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
