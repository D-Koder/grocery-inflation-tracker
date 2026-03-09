"use client";

import { createClient } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function TrendsPage() {
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) redirect("/auth/login");
    };
    checkAuth();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f0f0ff", marginBottom: 32 }}>Trends</h1>
      <p style={{ color: "#444468" }}>
        Trends page content from the zip file needs to be added here.
      </p>
    </div>
  );
}
