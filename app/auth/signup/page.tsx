"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#0f0f1a" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(167,139,250,0.3)" }}>🛒</div>
          <div>
            <div style={{ fontSize: 10, color: "#444468", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Personal</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#f0f0ff" }}>Grocery Tracker</div>
          </div>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#f0f0ff", letterSpacing: "-0.02em", marginBottom: 6 }}>Create your account</h1>
        <p style={{ color: "#444468", fontSize: 14, marginBottom: 28 }}>Start tracking your grocery prices today</p>
        <form onSubmit={handleSignup} noValidate>
          {[
            { label: "Email",            type: "email",    value: email,    set: setEmail,    placeholder: "you@example.com",   max: 254, auto: "email" },
            { label: "Password",         type: "password", value: password, set: setPassword, placeholder: "Min. 8 characters", max: 128, auto: "new-password" },
            { label: "Confirm Password", type: "password", value: confirm,  set: setConfirm,  placeholder: "Repeat password",   max: 128, auto: "new-password" },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#444468", textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} maxLength={f.max} autoComplete={f.auto} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#f0f0ff", fontSize: 14, fontFamily: "inherit" }} />
            </div>
          ))}
          {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: 14, borderRadius: 11, border: "none", background: loading ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 18px rgba(124,58,237,0.3)", marginTop: 6 }}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>
        <p style={{ textAlign: "center", color: "#444468", fontSize: 13, marginTop: 20 }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
