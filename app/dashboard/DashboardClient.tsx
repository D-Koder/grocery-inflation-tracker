"use client";

import { Receipt, SpendPoint } from "@/types";

interface Props {
  receipts: Receipt[];
  spendTrend: SpendPoint[];
  topMovers: Array<{ name: string; from: number; to: number; change: number }>;
}

export default function DashboardClient({ receipts, spendTrend, topMovers }: Props) {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f0f0ff", marginBottom: 32 }}>Dashboard</h1>
      <div style={{ color: "#606090" }}>
        <p>Total receipts: {receipts.length}</p>
        <p>Spend trends: {spendTrend.length} months</p>
        <p>Top price movers: {topMovers.length} items</p>
      </div>
      <p style={{ marginTop: 20, color: "#444468", fontSize: 14 }}>
        Note: Full dashboard features from DashboardClient.tsx (from the zip file) need to be added.
      </p>
    </div>
  );
}
