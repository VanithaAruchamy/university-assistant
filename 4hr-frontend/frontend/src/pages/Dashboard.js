// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { getProfile } from "../services/api";

export default function Dashboard({ student }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(r => setProfile(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={S.loading}>⏳ Loading profile...</div>;
  if (!profile) return <div style={S.loading}>Could not load profile.</div>;

  const attColor = profile.attendance_percentage >= 75 ? "#16a34a" : profile.attendance_percentage >= 65 ? "#d97706" : "#dc2626";
  const cgpaColor = profile.cgpa >= 8 ? "#16a34a" : profile.cgpa >= 6 ? "#d97706" : "#dc2626";
  const attStatus = profile.attendance_percentage >= 85 ? "Excellent" : profile.attendance_percentage >= 75 ? "Satisfactory" : profile.attendance_percentage >= 65 ? "Warning" : "Critical";
  const internEligible = profile.cgpa >= 7.0 && profile.attendance_percentage >= 75 && profile.active_backlogs === 0;

  return (
    <div style={S.wrap}>
      {/* Header card */}
      <div style={S.profileCard}>
        <div style={S.avatar}>{profile.name.charAt(0)}</div>
        <div style={S.profileMeta}>
          <h2 style={S.name}>{profile.name}</h2>
          <p style={S.dept}>{profile.department} · Year {profile.year}</p>
          <p style={S.idLine}>Student ID: <strong>{profile.student_id}</strong> <span style={S.masked}>(masked)</span></p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={S.grid}>
        <StatCard icon="📅" label="Attendance" value={`${profile.attendance_percentage}%`} color={attColor}
          sub={attStatus} subColor={attColor} />
        <StatCard icon="📊" label="CGPA" value={profile.cgpa.toFixed(2)} color={cgpaColor}
          sub={profile.cgpa >= 7.0 ? "✓ Above 7.0" : "⚠ Below 7.0"} subColor={cgpaColor} />
        <StatCard icon="📋" label="Backlogs" value={profile.active_backlogs}
          color={profile.active_backlogs === 0 ? "#16a34a" : "#dc2626"}
          sub={profile.active_backlogs === 0 ? "✓ No backlogs" : "⚠ Has backlogs"}
          subColor={profile.active_backlogs === 0 ? "#16a34a" : "#dc2626"} />
        <StatCard icon="💼" label="Internship" value={internEligible ? "Eligible" : "Not Eligible"}
          color={internEligible ? "#16a34a" : "#dc2626"}
          sub={internEligible ? "✓ All criteria met" : "✗ Check criteria"}
          subColor={internEligible ? "#16a34a" : "#dc2626"} />
      </div>

      {/* Criteria card */}
      <div style={S.criteriaCard}>
        <h3 style={S.criteriaTitle}>🎯 Internship Eligibility Criteria</h3>
        {[
          { label: "CGPA ≥ 7.0", met: profile.cgpa >= 7.0, value: profile.cgpa.toFixed(2) },
          { label: "Attendance ≥ 75%", met: profile.attendance_percentage >= 75, value: `${profile.attendance_percentage}%` },
          { label: "No Active Backlogs", met: profile.active_backlogs === 0, value: `${profile.active_backlogs} backlogs` },
        ].map(c => (
          <div key={c.label} style={S.criteriaRow}>
            <span style={{ ...S.criteriaStatus, color: c.met ? "#16a34a" : "#dc2626" }}>{c.met ? "✓" : "✗"}</span>
            <span style={S.criteriaLabel}>{c.label}</span>
            <span style={{ ...S.criteriaValue, color: c.met ? "#16a34a" : "#dc2626" }}>{c.value}</span>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div style={S.tip}>
        💡 <strong>Try asking:</strong> "What is my attendance?", "Am I eligible for internship?", or "Explain the condonation policy"
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub, subColor }) {
  return (
    <div style={SC.card}>
      <div style={SC.icon}>{icon}</div>
      <div style={{ ...SC.value, color }}>{value}</div>
      <div style={SC.label}>{label}</div>
      <div style={{ ...SC.sub, color: subColor }}>{sub}</div>
    </div>
  );
}

const S = {
  wrap: { padding: 24, overflowY: "auto", height: "100%", display: "flex", flexDirection: "column", gap: 20, fontFamily: "'Inter',sans-serif" },
  loading: { padding: 40, textAlign: "center", color: "#64748b", fontFamily: "'Inter',sans-serif" },
  profileCard: { display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", background: "linear-gradient(135deg,#0a0f1e,#0d47a1)", borderRadius: 18, color: "#fff" },
  avatar: { width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, flexShrink: 0 },
  profileMeta: {},
  name: { margin: "0 0 4px", fontSize: 20, fontWeight: 700 },
  dept: { margin: "0 0 4px", fontSize: 13, opacity: 0.8 },
  idLine: { margin: 0, fontSize: 12, opacity: 0.7 },
  masked: { fontSize: 10, background: "rgba(255,255,255,0.2)", padding: "1px 6px", borderRadius: 10 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  criteriaCard: { background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1.5px solid #e2e8f0" },
  criteriaTitle: { fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 14 },
  criteriaRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9" },
  criteriaStatus: { fontSize: 16, fontWeight: 700, width: 20, flexShrink: 0 },
  criteriaLabel: { flex: 1, fontSize: 13, color: "#374151" },
  criteriaValue: { fontSize: 13, fontWeight: 700 },
  tip: { background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#0369a1", lineHeight: 1.5 },
};

const SC = {
  card: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 16, textAlign: "center" },
  icon: { fontSize: 24, marginBottom: 8 },
  value: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  label: { fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  sub: { fontSize: 11, marginTop: 4, fontWeight: 600 },
};
