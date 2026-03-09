"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateReceiptInput } from "@/lib/sanitize";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3;
interface Props { open: boolean; onClose: () => void; }

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function AddReceiptModal({ open, onClose }: Props) {
  const [step, setStep]       = useState<Step>(1);
  const [file, setFile]       = useState<File | null>(null);
  const [store, setStore]     = useState("");
  const [date, setDate]       = useState(new Date().toISOString().split("T")[0]);
  const [total, setTotal]     = useState("");
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [saving, setSaving]   = useState(false);
  const [insight, setInsight] = useState("");
  const router = useRouter();

  if (!open) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setErrors({ file: "Only JPG, PNG, WebP, or PDF files are allowed" });
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setErrors({ file: "File must be under 10MB" });
      return;
    }
    setErrors({});
    setFile(f);
    setStep(2);
  };

  const handleSave = async () => {
    const result = validateReceiptInput({ store, date, total });
    if (!result.valid) { setErrors(result.errors); return; }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let image_url = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const filename = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(filename, file, { contentType: file.type, upsert: false });
        if (!uploadError) {
          const { data } = supabase.storage.from("receipts").getPublicUrl(filename);
          image_url = data.publicUrl;
        }
      }

      const { data: receipt, error: receiptError } = await supabase
        .from("receipts")
        .insert({ user_id: user.id, store: result.data.store, date: result.data.date, total: result.data.total, image_url })
        .select()
        .single();
      if (receiptError) throw new Error(receiptError.message);

      const { data: prevReceipts } = await supabase
        .from("receipts")
        .select("total")
        .eq("user_id", user.id)
        .eq("store", result.data.store)
        .neq("id", receipt.id)
        .order("date", { ascending: false })
        .limit(1);

      if (prevReceipts && prevReceipts.length > 0) {
        const prev = prevReceipts[0].total;
        const diff = ((result.data.total - prev) / prev) * 100;
        setInsight(diff > 0
          ? `Your ${result.data.store} basket is up ${diff.toFixed(1)}% vs your last visit.`
          : `Your ${result.data.store} basket is down ${Math.abs(diff).toFixed(1)}% vs your last visit.`
        );
      } else {
        setInsight(`First ${result.data.store} receipt saved. Add more to see trends.`);
      }

      setStep(3);
      router.refresh();
    } catch (e: any) {
      setErrors({ general: e.message ?? "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStep(1); setFile(null); setStore("");
    setDate(new Date().toISOString().split("T")[0]);
    setTotal(""); setErrors({}); setInsight(""); onClose();
  };

  const inputStyle = (hasError?: boolean) => ({
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: `1px solid ${hasError ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10, padding: "11px 14px", color: "#f0f0ff", fontSize: 14, fontFamily: "inherit",
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#12122a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,0.7)" }}>

        {step === 1 && (
          <div style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f0ff" }}>Add Receipt</div>
              <button onClick={handleClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#444468", fontSize: 16 }}>✕</button>
            </div>
            {errors.file && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>{errors.file}</div>}
            <label style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 12, marginBottom: 10, cursor: "pointer", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(167,139,250,0.3)" }}>
              <input type="file" accept="image/*,application/pdf" onChange={handleFileSelect} style={{ display: "none" }} />
              <span style={{ fontSize: 22 }}>📷</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#d4c4ff" }}>Scan / Upload Receipt</div>
                <div style={{ color: "#484870", fontSize: 12, marginTop: 2 }}>Photo, image or PDF from your device</div>
              </div>
            </label>
            <div onClick={() => setStep(2)} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 12, cursor: "pointer", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontSize: 22 }}>✏️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#d0d0f0" }}>Enter Manually</div>
                <div style={{ color: "#484870", fontSize: 12, marginTop: 2 }}>Type in store, date, and total</div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <button onClick={() => setStep(1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#a78bfa", fontSize: 18 }}>←</button>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f0ff" }}>Confirm Receipt</div>
            </div>
            {file && <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.22)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}><div style={{ color: "#34d399", fontSize: 13, fontWeight: 600 }}>✓ {file.name}</div></div>}
            <div style={{ color: "#484870", fontSize: 12, marginBottom: 16 }}>Confirm the basics — we&apos;ll handle the rest</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#444468", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Store</label>
              <input value={store} onChange={e => setStore(e.target.value)} placeholder="e.g. Whole Foods" maxLength={100} style={inputStyle(!!errors.store)} />
              {errors.store && <div style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.store}</div>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#444468", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split("T")[0]} style={{ ...inputStyle(!!errors.date), colorScheme: "dark" }} />
              {errors.date && <div style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.date}</div>}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#444468", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Total ($)</label>
              <input type="number" value={total} onChange={e => setTotal(e.target.value)} placeholder="0.00" min="0" max="9999" step="0.01" style={inputStyle(!!errors.total)} />
              {errors.total && <div style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.total}</div>}
            </div>
            {errors.general && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>{errors.general}</div>}
            <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: 13, borderRadius: 11, border: "none", background: saving ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 18px rgba(124,58,237,0.35)" }}>
              {saving ? "Saving…" : "Save Receipt"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 40px rgba(16,185,129,0.35)", fontSize: 28 }}>✓</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#f0f0ff", marginBottom: 8 }}>Receipt saved!</div>
            <div style={{ color: "#606090", marginBottom: 22, lineHeight: 1.6, fontSize: 14 }}>Your receipt has been added and insights updated.</div>
            {insight && (
              <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(139,92,246,0.28)", borderRadius: 12, padding: 16, textAlign: "left", marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#444468", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your Insight</div>
                <div style={{ fontSize: 14, color: "#c8c8e8", lineHeight: 1.65 }}>{insight}</div>
              </div>
            )}
            <button onClick={handleClose} style={{ width: "100%", padding: 13, borderRadius: 11, border: "none", background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 18px rgba(124,58,237,0.35)" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
