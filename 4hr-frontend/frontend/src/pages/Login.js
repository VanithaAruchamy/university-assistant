// src/pages/Login.js
import React, { useState } from "react";
import { login } from "../services/api";

const DEMO = [
  { id: "1001", name: "Tarun — ECE Yr3 (80% att)" },
  { id: "1002", name: "Sneha — CSE Yr1 (100% att)" },
  { id: "1044", name: "Nakul — ME Yr4 (eligible)" },
  { id: "1007", name: "Kiran — ECE Yr1 (65% att)" },
];

export default function Login({ onLogin }) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await login(studentId, password);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("student", JSON.stringify(res.data.student));
      onLogin(res.data.student);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.hero}>
          <div style={S.heroIcon}>🎓</div>
          <h1 style={S.title}>University AI Assistant</h1>
          <p style={S.sub}>Secure · RAG-Powered · JWT Auth</p>
          <div style={S.techBadges}>
            {["Node.js", "OpenAI", "Embeddings", "React"].map(t => (
              <span key={t} style={S.badge}>{t}</span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={S.form}>
          <div style={S.field}>
            <label style={S.label}>Student ID</label>
            <input style={S.input} type="text" placeholder="e.g. 1001"
              value={studentId} onChange={e => setStudentId(e.target.value)} required />
          </div>
          <div style={S.field}>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" placeholder="password123"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div style={S.err}>⚠️ {error}</div>}
          <button style={loading ? { ...S.btn, opacity: 0.7 } : S.btn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={S.demoBox}>
          <p style={S.demoTitle}>🔑 Demo Accounts — password: <strong>password123</strong></p>
          <div style={S.demoGrid}>
            {DEMO.map(d => (
              <button key={d.id} style={S.demoBtn}
                onClick={() => { setStudentId(d.id); setPassword("password123"); }}>
                <span style={S.demoId}>ID: {d.id}</span>
                <span style={S.demoName}>{d.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#0a0f1e,#1a237e,#0d47a1)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter',sans-serif" },
  card: { background: "#fff", borderRadius: 24, padding: "44px 40px", width: "100%", maxWidth: 460, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" },
  hero: { textAlign: "center", marginBottom: 32 },
  heroIcon: { fontSize: 54, marginBottom: 12 },
  title: { margin: "0 0 6px", fontSize: 24, fontWeight: 700, color: "#0d47a1" },
  sub: { margin: "0 0 14px", color: "#64748b", fontSize: 13 },
  techBadges: { display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" },
  badge: { background: "#e3f2fd", color: "#1565c0", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
  form: { display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: { padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none", fontFamily: "'Inter',sans-serif" },
  err: { background: "#fef2f2", color: "#dc2626", padding: "12px 16px", borderRadius: 10, fontSize: 13, border: "1px solid #fecaca" },
  btn: { background: "linear-gradient(135deg,#0d47a1,#1565c0)", color: "#fff", border: "none", padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif" },
  demoBox: { background: "#f8fafc", borderRadius: 14, padding: 16, border: "1px solid #e2e8f0" },
  demoTitle: { fontSize: 12, color: "#64748b", margin: "0 0 12px", textAlign: "center" },
  demoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  demoBtn: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "8px 10px", cursor: "pointer", textAlign: "left", fontFamily: "'Inter',sans-serif", display: "flex", flexDirection: "column", gap: 2 },
  demoId: { fontSize: 12, fontWeight: 700, color: "#0d47a1" },
  demoName: { fontSize: 11, color: "#64748b" },
};
