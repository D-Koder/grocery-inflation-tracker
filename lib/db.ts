import { createClient } from "@/lib/supabase/server";
import type { Receipt, ReceiptItem, SpendPoint, PricePoint } from "@/types";

export async function getReceipts(userId: string): Promise<Receipt[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getReceiptById(id: string, userId: string): Promise<Receipt | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receipts")
    .select("*, receipt_items(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function getSpendByMonth(userId: string): Promise<SpendPoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receipts")
    .select("date, total")
    .eq("user_id", userId)
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);

  const byMonth: Record<string, number> = {};
  for (const r of data ?? []) {
    const key = r.date.slice(0, 7);
    byMonth[key] = (byMonth[key] ?? 0) + Number(r.total);
  }
  return Object.entries(byMonth).map(([month, spend]) => ({
    month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    spend: Math.round(spend * 100) / 100,
  }));
}

export async function getItemPriceHistory(userId: string, searchTerm: string): Promise<PricePoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receipt_items")
    .select("price, created_at, name_normalized, receipts!inner(user_id, date, store)")
    .eq("receipts.user_id", userId)
    .ilike("name_normalized", `%${searchTerm}%`)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((item: any) => ({
    date: new Date(item.receipts.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    price: Number(item.price),
    store: item.receipts.store,
  }));
}

export async function getTopMovers(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("receipt_items")
    .select("name_normalized, price, receipts!inner(user_id, date)")
    .eq("receipts.user_id", userId)
    .not("name_normalized", "is", null)
    .order("receipts.date", { ascending: true });
  if (error) throw new Error(error.message);

  const itemMap: Record<string, number[]> = {};
  for (const row of data ?? []) {
    const name = row.name_normalized!;
    if (!itemMap[name]) itemMap[name] = [];
    itemMap[name].push(Number(row.price));
  }

  return Object.entries(itemMap)
    .filter(([, prices]) => prices.length >= 2)
    .map(([name, prices]) => {
      const from = prices[0];
      const to = prices[prices.length - 1];
      const changePct = ((to - from) / from) * 100;
      return { name, from, to, change: Math.round(changePct * 10) / 10 };
    })
    .filter(m => Math.abs(m.change) > 0)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 10);
}
