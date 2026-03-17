// src/pages/Chat.js
import React, { useState, useRef, useEffect } from "react";
import { sendChat } from "../services/api";

const SUGGESTIONS = [
  "What is my attendance percentage?",
  "Am I eligible for internship?",
  "What is the minimum attendance required?",
  "What is the exam passing criteria?",
  "Explain the condonation policy",
  "What are the lab attendance rules?",
  "What is the revaluation policy?",
];

export default function Chat() {
  const [messages, setMessages] = useState([{
    id: 1, role: "assistant", type: "welcome", time: new Date(),
    text: "👋 Hi! I'm your University AI Assistant powered by RAG + OpenAI embeddings.\n\nI can help you with:\n• 📚 University policies (with citations)\n• 📊 Your personal academic data\n• ✅ Eligibility checks\n\nAll responses are grounded in the official university handbook.",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(p => [...p, { id: Date.now(), role: "user", text: msg, time: new Date() }]);
    setLoading(true);
    try {
      const res = await sendChat(msg);
      const d = res.data;
      setMessages(p => [...p, {
        id: Date.now() + 1, role: "assistant",
        text: d.answer, type: d.response_type,
        sources: d.sources, data: d.data,
        confidence: d.confidence, time: new Date(),
      }]);
    } catch (err) {
      const errData = err.response?.data;
      setMessages(p => [...p, {
        id: Date.now() + 1, role: "assistant",
        text: errData?.error || "Something went wrong.",
        type: errData?.response_type === "BLOCKED" ? "BLOCKED" : "ERROR",
        time: new Date(),
      }]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  return (
    <div style={S.wrap}>
      <div style={S.messages}>
        {messages.map(m => <Bubble key={m.id} msg={m} />)}
        {loading && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 2 && (
        <div style={S.sugWrap}>
          <p style={S.sugLabel}>Quick questions:</p>
          <div style={S.chips}>
            {SUGGESTIONS.map(s => (
              <button key={s} style={S.chip} onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div style={S.inputRow}>
        <textarea ref={inputRef} style={S.textarea} rows={1} disabled={loading}
          placeholder="Ask about policies, attendance, CGPA, eligibility..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button style={loading || !input.trim() ? { ...S.sendBtn, opacity: 0.4 } : S.sendBtn}
          disabled={loading || !input.trim()} onClick={() => send()}>➤</button>
      </div>
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  const isError = msg.type === "ERROR";
  const isBlocked = msg.type === "BLOCKED";

  const typeLabel = {
    PERSONAL_DATA: { icon: "👤", label: "Your Data", color: "#0369a1" },
    POLICY_RAG: { icon: "📚", label: "Policy (RAG)", color: "#7c3aed" },
    BLOCKED: { icon: "🚫", label: "Blocked", color: "#dc2626" },
  }[msg.type];

  return (
    <div style={{ ...S.row, justifyContent: isUser ? "flex-end" : "flex-start" }}>
      {!isUser && <div style={S.botAvatar}>🎓</div>}
      <div style={{
        ...S.bubble,
        ...(isUser ? S.userBubble : S.botBubble),
        ...(isError || isBlocked ? S.errBubble : {}),
      }}>
        {/* Type badge */}
        {!isUser && typeLabel && (
          <div style={{ ...S.typeBadge, color: typeLabel.color }}>
            {typeLabel.icon} {typeLabel.label}
          </div>
        )}

        {/* Student data mini-card */}
        {msg.data && (
          <div style={S.dataCard}>
            <div style={S.dataRow}><span style={S.dk}>📅 Attendance</span><span style={{ ...S.dv, color: msg.data.attendance >= 75 ? "#16a34a" : "#dc2626" }}>{msg.data.attendance}%</span></div>
            <div style={S.dataRow}><span style={S.dk}>📊 CGPA</span><span style={{ ...S.dv, color: msg.data.cgpa >= 7.0 ? "#16a34a" : "#d97706" }}>{msg.data.cgpa}</span></div>
            <div style={S.dataRow}><span style={S.dk}>📋 Backlogs</span><span style={{ ...S.dv, color: msg.data.backlogs === 0 ? "#16a34a" : "#dc2626" }}>{msg.data.backlogs}</span></div>
          </div>
        )}

        <p style={{ ...S.text, color: isUser ? "#fff" : "#1e293b" }}>{msg.text}</p>

        {/* Sources */}
        {msg.sources?.length > 0 && (
          <div style={S.sources}>📖 Source: {msg.sources.join(", ")}</div>
        )}

        {/* Confidence score */}
        {msg.confidence !== undefined && msg.type === "POLICY_RAG" && (
          <div style={S.confRow}>
            <span style={S.confLabel}>Confidence</span>
            <div style={S.confBar}>
              <div style={{ ...S.confFill, width: `${msg.confidence}%`, background: msg.confidence >= 60 ? "#16a34a" : "#d97706" }} />
            </div>
            <span style={S.confPct}>{msg.confidence}%</span>
          </div>
        )}

        <div style={{ ...S.time, textAlign: isUser ? "right" : "left" }}>
          {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ ...S.row, justifyContent: "flex-start" }}>
      <div style={S.botAvatar}>🎓</div>
      <div style={{ ...S.bubble, ...S.botBubble }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 0.2, 0.4].map((d, i) => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#94a3b8", display: "inline-block", animation: `bounce 1s ${d}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  wrap: { display: "flex", flexDirection: "column", height: "100%", background: "#f8fafc" },
  messages: { flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 },
  row: { display: "flex", alignItems: "flex-end", gap: 8 },
  botAvatar: { fontSize: 20, flexShrink: 0, marginBottom: 4 },
  bubble: { maxWidth: "76%", borderRadius: 16, padding: "12px 16px", wordBreak: "break-word" },
  userBubble: { background: "linear-gradient(135deg,#0a0f1e,#0d47a1)", borderBottomRightRadius: 4 },
  botBubble: { background: "#fff", border: "1.5px solid #e2e8f0", borderBottomLeftRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  errBubble: { background: "#fef2f2", border: "1.5px solid #fecaca" },
  typeBadge: { fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" },
  dataCard: { background: "#f0f9ff", borderRadius: 10, padding: "10px 12px", marginBottom: 10, border: "1px solid #bae6fd" },
  dataRow: { display: "flex", justifyContent: "space-between", padding: "3px 0" },
  dk: { fontSize: 12, color: "#64748b" },
  dv: { fontSize: 12, fontWeight: 700 },
  text: { margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" },
  sources: { marginTop: 8, fontSize: 11, color: "#7c3aed", fontStyle: "italic" },
  confRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 8 },
  confLabel: { fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", flexShrink: 0 },
  confBar: { flex: 1, height: 4, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" },
  confFill: { height: "100%", borderRadius: 4, transition: "width 0.5s" },
  confPct: { fontSize: 10, fontWeight: 700, color: "#64748b", flexShrink: 0, width: 28, textAlign: "right" },
  time: { fontSize: 10, color: "#94a3b8", marginTop: 6 },
  sugWrap: { padding: "0 16px 12px" },
  sugLabel: { fontSize: 11, color: "#94a3b8", margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase" },
  chips: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#374151", fontFamily: "'Inter',sans-serif" },
  inputRow: { display: "flex", gap: 10, padding: "12px 16px", background: "#fff", borderTop: "1.5px solid #e2e8f0", alignItems: "flex-end" },
  textarea: { flex: 1, padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 14, resize: "none", outline: "none", fontFamily: "'Inter',sans-serif", lineHeight: 1.5, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0a0f1e,#0d47a1)", color: "#fff", fontSize: 18, cursor: "pointer", flexShrink: 0 },
};
