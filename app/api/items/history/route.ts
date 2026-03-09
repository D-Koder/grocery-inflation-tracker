import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sanitizeSearchQuery } from "@/lib/sanitize";
import { getItemPriceHistory } from "@/lib/db";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  const query = sanitizeSearchQuery(q);
  if (!query) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const history = await getItemPriceHistory(user.id, query);
  return NextResponse.json(history);
}
