import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Cell, PieChart, Pie
} from "recharts";

const FUNDS = [
  { code: "TLY", name: "Tera Portföy Birinci Serbest Fon", type: "Serbest", m1: 17.69, m3: 65.05, m6: 220.05, ytd: 56.12, y1: 1459.12, y3: 37506.26, y5: 458711.67 },
  { code: "DFI", name: "Atlas Portföy Serbest Fon", type: "Serbest", m1: 9.28, m3: 30.50, m6: 193.33, ytd: 29.35, y1: 865.53, y3: 1474.89, y5: null },
  { code: "PHE", name: "Pusula Portföy Hisse Senedi Fonu (HSY)", type: "Hisse", m1: 13.19, m3: 78.53, m6: 100.84, ytd: 77.83, y1: 138.05, y3: null, y5: null },
  { code: "FMG", name: "QNB Portföy Gümüş Serbest Fon", type: "Serbest", m1: -22.95, m3: -0.67, m6: 55.61, ytd: -1.20, y1: 128.49, y3: null, y5: null },
  { code: "DMG", name: "Deniz Portföy Gümüş Fon Sepeti Fonu", type: "Fon Sepeti", m1: -22.07, m3: -3.20, m6: 53.56, ytd: -2.47, y1: 124.68, y3: 517.33, y5: null },
  { code: "MJG", name: "Aktif Portföy Gümüş Fon Sepeti Fonu", type: "Fon Sepeti", m1: -22.64, m3: -2.29, m6: 50.17, ytd: -4.42, y1: 123.85, y3: 526.01, y5: null },
  { code: "BIH", name: "Pardus Portföy Birinci Hisse Senedi (TL) Fonu (HSY)", type: "Hisse", m1: 0.75, m3: 14.60, m6: 40.70, ytd: 14.33, y1: 122.02, y3: null, y5: null },
  { code: "IOG", name: "İş Portföy Gümüş Serbest Fon", type: "Serbest", m1: -24.38, m3: -5.53, m6: 48.71, ytd: -5.60, y1: 121.07, y3: 544.60, y5: 1189.61 },
  { code: "PPS", name: "Phillip Portföy Birinci Serbest Fon", type: "Serbest", m1: 6.79, m3: 24.16, m6: 34.28, ytd: 23.92, y1: 118.15, y3: 285.57, y5: null },
  { code: "PBR", name: "Pusula Portföy Birinci Değişken Fon", type: "Değişken", m1: 13.53, m3: 58.47, m6: 75.46, ytd: 58.11, y1: 113.56, y3: null, y5: null },
];

const TYPE_COLORS = {
  "Serbest": { bg: "#1a1a2e", text: "#e94560", dim: "rgba(233,69,96,0.12)", border: "rgba(233,69,96,0.3)" },
  "Hisse": { bg: "#1a2332", text: "#0ea5e9", dim: "rgba(14,165,233,0.12)", border: "rgba(14,165,233,0.3)" },
  "Fon Sepeti": { bg: "#1a2e1a", text: "#22c55e", dim: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)" },
  "Değişken": { bg: "#2e2a1a", text: "#eab308", dim: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.3)" },
};

const PALETTE = ["#e94560", "#0ea5e9", "#22c55e", "#eab308", "#a855f7", "#f97316", "#06b6d4", "#ec4899", "#14b8a6", "#f43f5e"];

const PERIODS = [
  { key: "m1", label: "1 Ay" },
  { key: "m3", label: "3 Ay" },
  { key: "m6", label: "6 Ay" },
  { key: "ytd", label: "YTD" },
  { key: "y1", label: "1 Yıl" },
];

export default function TEFASDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("y1");
  const [selectedFund, setSelectedFund] = useState(null);
  const [compareFunds, setCompareFunds] = useState(["TLY", "PHE", "PPS"]);
  const [tab, setTab] = useState("table");
  const [sortBy, setSortBy] = useState("y1");
  const [sortDir, setSortDir] = useState("desc");

  const sorted = useMemo(() => {
    return [...FUNDS].sort((a, b) => {
      const av = a[sortBy] ?? -Infinity;
      const bv = b[sortBy] ?? -Infinity;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [sortBy, sortDir]);

  const toggleCompare = (code) => {
    setCompareFunds(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : prev.length < 5 ? [...prev, code] : prev
    );
  };

  const handleSort = (key) => {
    if (sortBy === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(key); setSortDir("desc"); }
  };

  const typeDist = useMemo(() => {
    const m = {};
    FUNDS.forEach(f => { m[f.type] = (m[f.type] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, []);

  const bestPerformer = useMemo(() => {
    return [...FUNDS].sort((a, b) => (b[selectedPeriod] ?? -Infinity) - (a[selectedPeriod] ?? -Infinity))[0];
  }, [selectedPeriod]);

  const worstPerformer = useMemo(() => {
    return [...FUNDS].sort((a, b) => (a[selectedPeriod] ?? Infinity) - (b[selectedPeriod] ?? Infinity))[0];
  }, [selectedPeriod]);

  const avgReturn = useMemo(() => {
    const vals = FUNDS.map(f => f[selectedPeriod]).filter(v => v != null);
    return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length) : 0;
  }, [selectedPeriod]);

  const positiveCount = useMemo(() => {
    return FUNDS.filter(f => f[selectedPeriod] != null && f[selectedPeriod] > 0).length;
  }, [selectedPeriod]);

  const formatPct = (v) => {
    if (v == null) return "—";
    const s = v >= 0 ? "+" : "";
    if (Math.abs(v) >= 1000) return `${s}${(v/1000).toFixed(1)}K%`;
    return `${s}${v.toFixed(2)}%`;
  };

  const PctCell = ({ value }) => {
    if (value == null) return <span style={{ color: "#475569" }}>—</span>;
    const pos = value >= 0;
    return (
      <span style={{
        color: pos ? "#22c55e" : "#ef4444",
        fontFamily: "'DM Mono', monospace",
        fontWeight: 600,
        fontSize: 13,
      }}>
        {formatPct(value)}
      </span>
    );
  };

  const TypeTag = ({ type }) => {
    const c = TYPE_COLORS[type] || TYPE_COLORS["Serbest"];
    return (
      <span style={{
        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
        background: c.dim, color: c.text, border: `1px solid ${c.border}`,
        letterSpacing: 0.3,
      }}>{type}</span>
    );
  };

  const radarData = useMemo(() => {
    if (compareFunds.length === 0) return [];
    const metrics = [
      { key: "m1", label: "1 Ay" },
      { key: "m3", label: "3 Ay" },
      { key: "m6", label: "6 Ay" },
      { key: "ytd", label: "YTD" },
      { key: "y1", label: "1 Yıl" },
    ];
    const maxVals = {};
    metrics.forEach(m => {
      const vals = FUNDS.filter(f => compareFunds.includes(f.code)).map(f => Math.abs(f[m.key] ?? 0));
      maxVals[m.key] = Math.max(...vals, 1);
    });
    return metrics.map(m => {
      const row = { metric: m.label };
      FUNDS.filter(f => compareFunds.includes(f.code)).forEach(f => {
        row[f.code] = ((f[m.key] ?? 0) / maxVals[m.key]) * 100;
      });
      return row;
    });
  }, [compareFunds]);

  const tabs = [
    { key: "table", label: "Fon Tablosu", icon: "▦" },
    { key: "compare", label: "Karşılaştır", icon: "⟺" },
    { key: "detail", label: "Detay", icon: "◉" },
  ];

  const periodLabel = PERIODS.find(p => p.key === selectedPeriod)?.label || "";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#08090d",
      color: "#e2e8f0",
      fontFamily: "'Outfit', 'Satoshi', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f1117; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>

      {/* HEADER */}
      <header style={{
        padding: "28px 32px 20px",
        borderBottom: "1px solid #151922",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          background: "repeating-linear-gradient(90deg, #e94560 0px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, #e94560 0px, transparent 1px, transparent 80px)",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10,
            padding: "5px 12px", borderRadius: 20, background: "rgba(233,69,96,0.08)",
            border: "1px solid rgba(233,69,96,0.2)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e94560", animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#e94560", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
              TEFAS VERİLERİ
            </span>
          </div>

          <h1 style={{
            fontSize: 30, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5,
            background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Fon Performans Analizi
          </h1>
          <p style={{ color: "#475569", fontSize: 13, margin: 0, fontFamily: "'DM Mono', monospace" }}>
            Takasbank TEFAS · İlk 10 Fon · Mart 2026
          </p>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 2, marginTop: 20, position: "relative" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); if (t.key !== "detail") setSelectedFund(null); }}
              style={{
                padding: "10px 18px", border: "none", cursor: "pointer",
                borderRadius: "8px 8px 0 0", fontSize: 13, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 6,
                background: tab === t.key ? "#111318" : "transparent",
                color: tab === t.key ? "#e94560" : "#475569",
                borderBottom: tab === t.key ? "2px solid #e94560" : "2px solid transparent",
                transition: "all 0.2s ease",
              }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ padding: "24px 32px", maxWidth: 1360, margin: "0 auto" }}>

        {/* PERIOD SELECTOR */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#475569", marginRight: 8, fontFamily: "'DM Mono', monospace" }}>DÖNEM:</span>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setSelectedPeriod(p.key)}
              style={{
                padding: "7px 16px", borderRadius: 8, border: "1px solid",
                borderColor: selectedPeriod === p.key ? "#e94560" : "#1e293b",
                background: selectedPeriod === p.key ? "rgba(233,69,96,0.1)" : "transparent",
                color: selectedPeriod === p.key ? "#e94560" : "#64748b",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                fontFamily: "'DM Mono', monospace", transition: "all 0.2s",
              }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Ortalama Getiri", value: formatPct(avgReturn), color: avgReturn >= 0 ? "#22c55e" : "#ef4444", sub: periodLabel },
            { label: "En İyi Fon", value: bestPerformer?.code, color: "#e94560", sub: formatPct(bestPerformer?.[selectedPeriod]) },
            { label: "En Düşük Fon", value: worstPerformer?.code, color: "#f97316", sub: formatPct(worstPerformer?.[selectedPeriod]) },
            { label: "Pozitif / Toplam", value: `${positiveCount} / ${FUNDS.length}`, color: "#0ea5e9", sub: `${periodLabel} döneminde` },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#111318", borderRadius: 14, padding: "18px 20px",
              border: "1px solid #1a1f2e", position: "relative", overflow: "hidden",
              animation: `fadeUp 0.5s ease ${i * 0.08}s both`,
            }}>
              <div style={{ position: "absolute", bottom: -30, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${s.color}06` }} />
              <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* TAB: TABLE */}
        {tab === "table" && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            {/* Bar chart overview */}
            <div style={{
              background: "#111318", borderRadius: 16, padding: 24,
              border: "1px solid #1a1f2e", marginBottom: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>
                {periodLabel} Getiri Karşılaştırması
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sorted.map(f => ({ code: f.code, value: f[selectedPeriod] ?? 0 }))} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" horizontal={false} />
                  <XAxis type="number" stroke="#334155" fontSize={11} tickFormatter={v => `${v}%`} />
                  <YAxis dataKey="code" type="category" stroke="#475569" fontSize={12} width={45} tick={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ background: "#111318", border: "1px solid #1a1f2e", borderRadius: 10, fontSize: 13 }}
                    formatter={(v) => [`${v.toFixed(2)}%`, "Getiri"]}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                    {sorted.map((f, i) => (
                      <Cell key={i} fill={(f[selectedPeriod] ?? 0) >= 0 ? PALETTE[i % PALETTE.length] : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div style={{
              background: "#111318", borderRadius: 16, border: "1px solid #1a1f2e", overflow: "hidden",
            }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {[
                        { key: null, label: "Fon" },
                        { key: null, label: "Tür" },
                        { key: "m1", label: "1 Ay" },
                        { key: "m3", label: "3 Ay" },
                        { key: "m6", label: "6 Ay" },
                        { key: "ytd", label: "YTD" },
                        { key: "y1", label: "1 Yıl" },
                        { key: "y3", label: "3 Yıl" },
                      ].map((h, i) => (
                        <th key={i} onClick={() => h.key && handleSort(h.key)}
                          style={{
                            padding: "14px 12px", textAlign: h.key ? "right" : "left",
                            color: sortBy === h.key ? "#e94560" : "#475569",
                            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                            letterSpacing: 1, fontFamily: "'DM Mono', monospace",
                            borderBottom: "1px solid #1a1f2e", whiteSpace: "nowrap",
                            cursor: h.key ? "pointer" : "default",
                            userSelect: "none",
                            background: sortBy === h.key ? "rgba(233,69,96,0.04)" : "transparent",
                          }}>
                          {h.label} {sortBy === h.key && (sortDir === "desc" ? "↓" : "↑")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((f, i) => (
                      <tr key={f.code}
                        onClick={() => { setSelectedFund(f); setTab("detail"); }}
                        style={{
                          borderBottom: "1px solid #13161d",
                          cursor: "pointer",
                          transition: "background 0.15s",
                          animation: `fadeUp 0.4s ease ${i * 0.04}s both`,
                        }}
                        onMouseOver={e => e.currentTarget.style.background = "#151922"}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "14px 12px" }}>
                          <div style={{ fontWeight: 700, color: PALETTE[i % PALETTE.length], fontFamily: "'DM Mono', monospace", fontSize: 14 }}>
                            {f.code}
                          </div>
                          <div style={{ fontSize: 11, color: "#475569", marginTop: 2, maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {f.name}
                          </div>
                        </td>
                        <td style={{ padding: "14px 12px" }}><TypeTag type={f.type} /></td>
                        {["m1", "m3", "m6", "ytd", "y1", "y3"].map(k => (
                          <td key={k} style={{
                            padding: "14px 12px", textAlign: "right",
                            background: k === selectedPeriod ? "rgba(233,69,96,0.03)" : "transparent",
                          }}>
                            <PctCell value={f[k]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Type distribution */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
              <div style={{ background: "#111318", borderRadius: 16, padding: 24, border: "1px solid #1a1f2e" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>Fon Türü Dağılımı</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={typeDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {typeDist.map((d, i) => (
                        <Cell key={i} fill={TYPE_COLORS[d.name]?.text || PALETTE[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#111318", border: "1px solid #1a1f2e", borderRadius: 10, fontSize: 12 }} />
                    <Legend formatter={v => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "#111318", borderRadius: 16, padding: 24, border: "1px solid #1a1f2e" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>Dönemsel Ortalamalar</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={PERIODS.map(p => {
                    const vals = FUNDS.map(f => f[p.key]).filter(v => v != null);
                    return { period: p.label, avg: vals.length ? +(vals.reduce((s,v) => s+v, 0) / vals.length).toFixed(2) : 0 };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
                    <XAxis dataKey="period" stroke="#475569" fontSize={11} />
                    <YAxis stroke="#334155" fontSize={11} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ background: "#111318", border: "1px solid #1a1f2e", borderRadius: 10, fontSize: 12 }} formatter={v => [`${v}%`, "Ortalama"]} />
                    <Bar dataKey="avg" radius={[6,6,0,0]} maxBarSize={40}>
                      {PERIODS.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COMPARE */}
        {tab === "compare" && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>Karşılaştırmak istediğiniz fonları seçin (maks. 5)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {FUNDS.map((f, i) => (
                  <button key={f.code} onClick={() => toggleCompare(f.code)}
                    style={{
                      padding: "8px 16px", borderRadius: 10,
                      border: `1.5px solid ${compareFunds.includes(f.code) ? PALETTE[i] : "#1e293b"}`,
                      background: compareFunds.includes(f.code) ? `${PALETTE[i]}12` : "transparent",
                      color: compareFunds.includes(f.code) ? PALETTE[i] : "#475569",
                      cursor: "pointer", fontSize: 13, fontWeight: 700,
                      fontFamily: "'DM Mono', monospace", transition: "all 0.2s",
                    }}>
                    {f.code}
                  </button>
                ))}
              </div>
            </div>

            {compareFunds.length > 0 && (
              <>
                {/* Multi-period bar comparison */}
                <div style={{ background: "#111318", borderRadius: 16, padding: 24, border: "1px solid #1a1f2e", marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>Dönem Bazlı Getiri Karşılaştırması</div>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={PERIODS.map(p => {
                      const row = { period: p.label };
                      FUNDS.filter(f => compareFunds.includes(f.code)).forEach(f => {
                        row[f.code] = f[p.key] ?? 0;
                      });
                      return row;
                    })}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
                      <XAxis dataKey="period" stroke="#475569" fontSize={12} />
                      <YAxis stroke="#334155" fontSize={11} tickFormatter={v => `${v}%`} />
                      <Tooltip contentStyle={{ background: "#111318", border: "1px solid #1a1f2e", borderRadius: 10, fontSize: 12 }} formatter={v => [`${v.toFixed(2)}%`]} />
                      <Legend formatter={v => <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{v}</span>} />
                      {compareFunds.map((code, i) => (
                        <Bar key={code} dataKey={code} fill={PALETTE[FUNDS.findIndex(f => f.code === code) % PALETTE.length]} radius={[4,4,0,0]} maxBarSize={32} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar */}
                <div style={{ background: "#111318", borderRadius: 16, padding: 24, border: "1px solid #1a1f2e", marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>Performans Radar Grafiği (normalize)</div>
                  <ResponsiveContainer width="100%" height={340}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#1a1f2e" />
                      <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={12} />
                      <PolarRadiusAxis stroke="#1a1f2e" fontSize={10} />
                      {compareFunds.map((code, i) => (
                        <Radar key={code} name={code} dataKey={code}
                          stroke={PALETTE[FUNDS.findIndex(f => f.code === code) % PALETTE.length]}
                          fill={PALETTE[FUNDS.findIndex(f => f.code === code) % PALETTE.length]}
                          fillOpacity={0.1} strokeWidth={2}
                        />
                      ))}
                      <Legend formatter={v => <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{v}</span>} />
                      <Tooltip contentStyle={{ background: "#111318", border: "1px solid #1a1f2e", borderRadius: 10, fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary table */}
                <div style={{ background: "#111318", borderRadius: 16, padding: 24, border: "1px solid #1a1f2e" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>Özet Tablo</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "10px 12px", textAlign: "left", color: "#475569", fontSize: 11, fontFamily: "'DM Mono', monospace", borderBottom: "1px solid #1a1f2e" }}>Fon</th>
                          {PERIODS.map(p => (
                            <th key={p.key} style={{ padding: "10px 12px", textAlign: "right", color: "#475569", fontSize: 11, fontFamily: "'DM Mono', monospace", borderBottom: "1px solid #1a1f2e" }}>{p.label}</th>
                          ))}
                          <th style={{ padding: "10px 12px", textAlign: "right", color: "#475569", fontSize: 11, fontFamily: "'DM Mono', monospace", borderBottom: "1px solid #1a1f2e" }}>3 Yıl</th>
                        </tr>
                      </thead>
                      <tbody>
                        {FUNDS.filter(f => compareFunds.includes(f.code)).map((f, i) => (
                          <tr key={f.code} style={{ borderBottom: "1px solid #13161d" }}>
                            <td style={{ padding: "12px", fontWeight: 700, color: PALETTE[FUNDS.indexOf(f) % PALETTE.length], fontFamily: "'DM Mono', monospace" }}>{f.code}</td>
                            {[...PERIODS.map(p => p.key), "y3"].map(k => (
                              <td key={k} style={{ padding: "12px", textAlign: "right" }}><PctCell value={f[k]} /></td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: DETAIL */}
        {tab === "detail" && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            {!selectedFund ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>◉</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Bir fon seçin</div>
                <div style={{ fontSize: 13 }}>Tablo sekmesinde herhangi bir fona tıklayarak detayını görebilirsiniz.</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 24 }}>
                  {FUNDS.map((f, i) => (
                    <button key={f.code} onClick={() => setSelectedFund(f)}
                      style={{
                        padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${PALETTE[i]}30`,
                        background: "transparent", color: PALETTE[i], cursor: "pointer",
                        fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono', monospace",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = `${PALETTE[i]}10`; e.currentTarget.style.borderColor = PALETTE[i]; }}
                      onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = `${PALETTE[i]}30`; }}
                    >
                      {f.code}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Fund header */}
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: `${PALETTE[FUNDS.indexOf(selectedFund) % PALETTE.length]}15`,
                    border: `2px solid ${PALETTE[FUNDS.indexOf(selectedFund) % PALETTE.length]}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'DM Mono', monospace", fontWeight: 800, fontSize: 16,
                    color: PALETTE[FUNDS.indexOf(selectedFund) % PALETTE.length],
                  }}>
                    {selectedFund.code}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{selectedFund.name}</h2>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                      <TypeTag type={selectedFund.type} />
                      <span style={{ color: "#475569", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>TEFAS: {selectedFund.code}</span>
                    </div>
                  </div>
                </div>

                {/* Metric cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
                  {[
                    { label: "1 Ay", value: selectedFund.m1, key: "m1" },
                    { label: "3 Ay", value: selectedFund.m3, key: "m3" },
                    { label: "6 Ay", value: selectedFund.m6, key: "m6" },
                    { label: "YTD", value: selectedFund.ytd, key: "ytd" },
                    { label: "1 Yıl", value: selectedFund.y1, key: "y1" },
                    { label: "3 Yıl", value: selectedFund.y3, key: "y3" },
                    { label: "5 Yıl", value: selectedFund.y5, key: "y5" },
                  ].map((m, i) => (
                    <div key={i} style={{
                      background: "#111318", borderRadius: 12, padding: "16px 18px",
                      border: `1px solid ${m.key === selectedPeriod ? "rgba(233,69,96,0.3)" : "#1a1f2e"}`,
                      animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
                    }}>
                      <div style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{m.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'DM Mono', monospace", color: m.value == null ? "#334155" : m.value >= 0 ? "#22c55e" : "#ef4444" }}>
                        {formatPct(m.value)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detail charts */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ background: "#111318", borderRadius: 16, padding: 24, border: "1px solid #1a1f2e" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>Dönemsel Getiri Profili</div>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={[
                        { period: "1 Ay", value: selectedFund.m1 },
                        { period: "3 Ay", value: selectedFund.m3 },
                        { period: "6 Ay", value: selectedFund.m6 },
                        { period: "YTD", value: selectedFund.ytd },
                        { period: "1 Yıl", value: selectedFund.y1 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
                        <XAxis dataKey="period" stroke="#475569" fontSize={11} />
                        <YAxis stroke="#334155" fontSize={11} tickFormatter={v => `${v}%`} />
                        <Tooltip contentStyle={{ background: "#111318", border: "1px solid #1a1f2e", borderRadius: 10, fontSize: 12 }} formatter={v => [`${v?.toFixed(2)}%`, "Getiri"]} />
                        <Bar dataKey="value" radius={[8,8,0,0]} maxBarSize={48}>
                          {PERIODS.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ background: "#111318", borderRadius: 16, padding: 24, border: "1px solid #1a1f2e" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginBottom: 16 }}>Sıralama (Seçili Dönem: {periodLabel})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                      {[...FUNDS].sort((a, b) => (b[selectedPeriod] ?? -Infinity) - (a[selectedPeriod] ?? -Infinity)).map((f, i) => {
                        const isSelected = f.code === selectedFund.code;
                        const val = f[selectedPeriod];
                        const maxVal = Math.max(...FUNDS.map(x => Math.abs(x[selectedPeriod] ?? 0)));
                        const barWidth = maxVal ? (Math.abs(val ?? 0) / maxVal) * 100 : 0;
                        return (
                          <div key={f.code} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "6px 8px",
                            borderRadius: 8, background: isSelected ? "rgba(233,69,96,0.08)" : "transparent",
                            border: isSelected ? "1px solid rgba(233,69,96,0.2)" : "1px solid transparent",
                          }}>
                            <span style={{ width: 20, fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>
                              {i + 1}
                            </span>
                            <span style={{ width: 40, fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: isSelected ? "#e94560" : "#94a3b8" }}>
                              {f.code}
                            </span>
                            <div style={{ flex: 1, height: 8, background: "#1a1f2e", borderRadius: 4, overflow: "hidden" }}>
                              <div style={{
                                width: `${barWidth}%`, height: "100%", borderRadius: 4,
                                background: (val ?? 0) >= 0 ? (isSelected ? "#e94560" : "#22c55e") : "#ef4444",
                                transition: "width 0.6s ease",
                              }} />
                            </div>
                            <span style={{ width: 70, textAlign: "right", fontSize: 12, fontFamily: "'DM Mono', monospace", color: (val ?? 0) >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                              {formatPct(val)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Switch fund */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
                  {FUNDS.filter(f => f.code !== selectedFund.code).map((f, i) => (
                    <button key={f.code} onClick={() => setSelectedFund(f)}
                      style={{
                        padding: "7px 14px", borderRadius: 8, border: "1px solid #1e293b",
                        background: "transparent", color: "#64748b", cursor: "pointer",
                        fontSize: 12, fontWeight: 600, fontFamily: "'DM Mono', monospace",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = "#e94560"; e.currentTarget.style.color = "#e94560"; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#64748b"; }}
                    >
                      {f.code}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 28, padding: "14px 18px", borderRadius: 10,
          background: "#111318", border: "1px solid #1a1f2e",
        }}>
          <p style={{ color: "#334155", fontSize: 11, margin: 0, lineHeight: 1.7, fontFamily: "'DM Mono', monospace" }}>
            ⚠ Veriler Takasbank TEFAS fon karşılaştırma sayfasından alınmıştır. Geçmiş performans gelecek getiriyi garanti etmez. Yatırım kararlarınız için güncel verileri TEFAS, KAP ve SPK kaynaklarından kontrol ediniz.
          </p>
        </div>
      </div>
    </div>
  );
}
