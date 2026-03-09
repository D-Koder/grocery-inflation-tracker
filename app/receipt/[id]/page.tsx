import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ReceiptDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f0f0ff", marginBottom: 32 }}>Receipt Details</h1>
      <p style={{ color: "#444468" }}>
        Receipt detail page content for ID: {params.id} needs to be added here.
      </p>
    </div>
  );
}
