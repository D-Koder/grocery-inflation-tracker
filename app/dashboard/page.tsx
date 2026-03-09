import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getReceipts, getSpendByMonth, getTopMovers } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const [receipts, spendTrend, topMovers] = await Promise.all([
    getReceipts(user.id),
    getSpendByMonth(user.id),
    getTopMovers(user.id),
  ]);
  return <DashboardClient receipts={receipts} spendTrend={spendTrend} topMovers={topMovers} />;
}
