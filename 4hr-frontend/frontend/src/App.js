import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";

export default function App() {
  const [student, setStudent] = useState(null);
  const [tab, setTab] = useState("chat");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const saved = localStorage.getItem("student");
    if (token && saved) { try { setStudent(JSON.parse(saved)); } catch { localStorage.clear(); } }
  }, []);

  const logout = () => { localStorage.clear(); setStudent(null); };
  if (!student) return <Login onLogin={setStudent} />;

  const navItems = [
    { id: "chat", icon: "💬", label: "AI Chat" },
    { id: "dashboard", icon: "📊", label: "My Profile" },
  ];

  return (
    <div style={S.app}>
      <aside style={S.sidebar}>
        <div style={S.sideTop}>
          <div style={S.brand}>
            <span style={{ fontSize: 30 }}>🎓</span>
            <div>
              <div style={S.brandName}>UniAssist AI</div>
              <div style={S.brandSub}>RAG + Embeddings</div>
            </div>
          </div>
          <nav style={S.nav}>
            {navItems.map(item => (
              <button key={item.id}
                style={tab === item.id ? { ...S.navBtn, ...S.navActive } : S.navBtn}
                onClick={() => setTab(item.id)}>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>

          <div style={S.infoBox}>
            <div style={S.infoTitle}>🔒 Security Features</div>
            {["✓ JWT Authentication","✓ Prompt Injection Guard","✓ PII Masking","✓ RBAC Enforced","✓ Vector RAG (Embeddings)"].map(f => (
              <div key={f} style={S.infoItem}>{f}</div>
            ))}
          </div>

          <div style={S.infoBox}>
            <div style={S.infoTitle}>📐 Scoring (100pts)</div>
            {["RAG Accuracy · 20%","Backend APIs · 20%","Security · 15%","Guardrails · 15%","CI/CD Tests · 20%"].map(f => (
              <div key={f} style={S.infoItem}>{f}</div>
            ))}
          </div>
        </div>

        <div style={S.sideBottom}>
          <div style={S.userRow}>
            <div style={S.userAvatar}>{student.name.charAt(0)}</div>
            <div>
              <div style={S.userName}>{student.name}</div>
              <div style={S.userMeta}>{student.department} · Year {student.year}</div>
            </div>
          </div>
          <button style={S.logoutBtn} onClick={logout}>🚪 Sign Out</button>
        </div>
      </aside>

      <main style={S.main}>
        <header style={S.header}>
          <div>
            <h1 style={S.pageTitle}>
              {tab === "chat" ? "💬 Ask UniAssist AI" : "📊 Academic Profile"}
            </h1>
            <p style={S.pageSub}>
              {tab === "chat"
                ? "RAG-powered answers with citations · OpenAI Embeddings · Confidence scores"
                : "Your academic data · PII masked · Internship eligibility"}
            </p>
          </div>
          <div style={S.onlineBadge}>🟢 AI + RAG Online</div>
        </header>
        <div style={S.content}>
          {tab === "chat" ? <Chat /> : <Dashboard student={student} />}
        </div>
      </main>
    </div>
  );
}

const S = {
  app: { display: "flex", height: "100vh", fontFamily: "'Inter',sans-serif", background: "#f1f5f9" },
  sidebar: { width: 270, background: "#0a0f1e", display: "flex", flexDirection: "column", justifyContent: "space-between", flexShrink: 0 },
  sideTop: { padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  brandName: { fontSize: 17, fontWeight: 700, color: "#fff" },
  brandSub: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  nav: { display: "flex", flexDirection: "column", gap: 4 },
  navBtn: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: "none", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500, cursor: "pointer", textAlign: "left", fontFamily: "'Inter',sans-serif" },
  navActive: { background: "rgba(255,255,255,0.12)", color: "#fff" },
  infoBox: { background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 14, border: "1px solid rgba(255,255,255,0.08)" },
  infoTitle: { fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" },
  infoItem: { fontSize: 11, color: "rgba(255,255,255,0.65)", padding: "3px 0" },
  sideBottom: { padding: 16, borderTop: "1px solid rgba(255,255,255,0.08)" },
  userRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  userAvatar: { width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 600, color: "#fff" },
  userMeta: { fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 },
  logoutBtn: { width: "100%", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontFamily: "'Inter',sans-serif" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 28px", background: "#fff", borderBottom: "1.5px solid #e2e8f0", flexShrink: 0 },
  pageTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: "#0d47a1" },
  pageSub: { margin: "4px 0 0", fontSize: 12, color: "#64748b" },
  onlineBadge: { fontSize: 12, color: "#16a34a", fontWeight: 600, background: "#f0fdf4", padding: "6px 14px", borderRadius: 20, border: "1px solid #bbf7d0", flexShrink: 0 },
  content: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" },
};
