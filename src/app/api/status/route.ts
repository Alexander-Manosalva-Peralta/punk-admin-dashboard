import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const hasKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  let testQueryError = null;
  let testQueryData = null;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("merchants").select("id, email").limit(2);
      testQueryError = error ? error.message : null;
      testQueryData = data;
    } catch (e: any) {
      testQueryError = e.message;
    }
  }

  return NextResponse.json({
    isSupabaseConfigured,
    hasUrl: Boolean(url),
    urlSnippet: url ? url.substring(0, 25) + "..." : "NOT_SET",
    hasKey,
    testQueryError,
    testQueryData,
  });
}
