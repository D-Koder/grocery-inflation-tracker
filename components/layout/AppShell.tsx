"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AddReceiptModal from "@/components/AddReceiptModal";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
  { href: "/receipts",  label: "Receipts",  icon: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z M8 10h8 M8 14h8" },
  { href: "/insights",  label: "Insights",  icon: "M18 20V10 M12 20V4 M6 20v-6 M2 20h20" },
  { href: "/trends",    label: "Trends",    icon: "M23 6L13.5 15.5 8.5 10.5 1 18 M17 6h6v6" },
];

function NavIcon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "block" }}>
      {d.split(" M").map((seg, i) => <path key={i} d={i === 0 ? seg : "M" + seg} />)}
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [showAdd,   setShowAdd]   = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile,  setIsMobile]  = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const plusIcon = "M12 5v14 M5 12h14";
  const basketIcon = "M5 11l4-7 M19 11l-4-7 M2 11h20 M3.5 11l1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L21 11 M9 11l1 9 M14 11l-1 9";
  const logoutIcon = "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f0f1a" }}>

      {!isMobile && (
        <aside style={{ width: collapsed ? 64 : 220, flexShrink: 0, height: "100vh", position: "sticky", top: 0, background: "#0b0b18", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", transition: "width 0.2s ease", overflow: "hidden" }}>
          <div onClick={() => setCollapsed(c => !c)} style={{ padding: "20px 14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 18px rgba(167,139,250,0.3)", color: "#fff" }}>
              <NavIcon d={basketIcon} size={18} />
            </div>
            {!collapsed && (
              <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 10, color: "#444468", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Personal</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#e0e0f8" }}>Grocery Tracker</div>
              </div>
            )}
          </div>

          <nav style={{ flex: 1, padding: "10px 8px" }}>
            {NAV.map(n => {
              const active = pathname === n.href;
              return (
                <Link key={n.href} href={n.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, marginBottom: 2, overflow: "hidden", whiteSpace: "nowrap", background: active ? "rgba(139,92,246,0.14)" : "transparent", color: active ? "#a78bfa" : "#484870", fontWeight: active ? 700 : 500, fontSize: 14, textDecoration: "none", transition: "background 0.15s,color 0.15s" }}>
                  <NavIcon d={n.icon} size={18} />
                  {!collapsed && <span style={{ flex: 1 }}>{n.label}</span>}
                  {!collapsed && active && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa", flexShrink: 0 }} />}
                </Link>
              );
            })}
          </nav>

          <div style={{ padding: "10px 8px 22px" }}>
            <div onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 10px", borderRadius: 11, overflow: "hidden", whiteSpace: "nowrap", background: "linear-gradient(135deg,#7c3aed,#a855f7)", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: "0 4px 18px rgba(124,58,237,0.35)", marginBottom: 8 }}>
              <NavIcon d={plusIcon} size={18} />
              {!collapsed && "Add Receipt"}
            </div>
            <div onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, overflow: "hidden", whiteSpace: "nowrap", color: "#484870", cursor: "pointer", fontSize: 14 }}>
              <NavIcon d={logoutIcon} size={18} />
              {!collapsed && "Sign Out"}
            </div>
          </div>
        </aside>
      )}

      <main style={{ flex: 1, overflowY: "auto", minHeight: "100vh", paddingBottom: isMobile ? 80 : 0 }}>
        <div style={{ maxWidth: isMobile ? "100%" : 920, margin: "0 auto", padding: isMobile ? "24px 16px" : "32px 40px" }}>
          {children}
        </div>
      </main>

      {isMobile && (
        <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "rgba(11,11,24,0.97)", backdropFilter: "blur(18px)", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0 18px" }}>
          {NAV.slice(0, 2).map(n => {
            const active = pathname === n.href;
            return (
              <Link key={n.href} href={n.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? "#a78bfa" : "#404068", fontSize: 10, fontWeight: active ? 700 : 400, textDecoration: "none" }}>
                <NavIcon d={n.icon} size={20} />
                {n.label}
              </Link>
            );
          })}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div onClick={() => setShowAdd(true)} style={{ width: 50, height: 50, borderRadius: "50%", marginTop: -18, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 0 24px rgba(167,139,250,0.45)", color: "#fff" }}>
              <NavIcon d={plusIcon} size={22} />
            </div>
            <span style={{ fontSize: 10, color: "#404068" }}>Add</span>
          </div>
          {NAV.slice(2, 4).map(n => {
            const active = pathname === n.href;
            return (
              <Link key={n.href} href={n.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? "#a78bfa" : "#404068", fontSize: 10, fontWeight: active ? 700 : 400, textDecoration: "none" }}>
                <NavIcon d={n.icon} size={20} />
                {n.label}
              </Link>
            );
          })}
        </nav>
      )}

      <AddReceiptModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
