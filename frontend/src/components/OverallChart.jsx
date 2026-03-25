import { useState } from "react";

const COLORS = ["#ffffff", "#a78bfa", "#22d3ee", "#fbbf24", "#4ade80"];

const PHASE_COLORS = {
  EMERGING: "#22d3ee",
  GROWING: "#a78bfa",
  PEAK: "#fbbf24",
  DECLINING: "#f87171",
  DEAD: "#6b7280",
};

export default function OverallChart({ predictions, rawScores }) {
  const [selected, setSelected] = useState(predictions?.[0]?.keyword || "");
  if (!predictions?.length) return null;

  const selectedPred = predictions.find(p => p.keyword === selected) || predictions[0];
  const timeline = selectedPred?.trendTimeline || [];
  const maxScore = Math.max(...timeline.map(t => t.score), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Score Comparison */}
      <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 28 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 24 }}>
          Composite Score Comparison
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {rawScores?.map((raw, i) => {
            const pred = predictions.find(p => p.keyword === raw.keyword);
            const score = raw.compositeScore || 0;
            const phase = pred?.trendPhase || "GROWING";
            return (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: "#ffffff" }}>{raw.keyword}</span>
                    <span style={{ fontSize: 11, color: PHASE_COLORS[phase] || "#8aabdd", background: "#0a0f1e", padding: "2px 8px", borderRadius: 4 }}>{phase}</span>
                  </div>
                  <span style={{ fontSize: 18, color: COLORS[i % COLORS.length], fontFamily: "'Instrument Serif', serif" }}>{score}</span>
                </div>
                <div style={{ background: "#1a2540", borderRadius: 6, height: 8, overflow: "hidden" }}>
                  <div style={{ width: score + "%", height: "100%", background: COLORS[i % COLORS.length], borderRadius: 6, transition: "width 1s ease" }} />
                </div>
                {pred && (
                  <div style={{ fontSize: 11, color: "#8aabdd", marginTop: 5 }}>
                    Peaks {pred.peakMonth} · Sustained until {pred.sustainedUntil}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd" }}>
            Trend Timeline Forecast
          </div>
          <select value={selected} onChange={e => setSelected(e.target.value)}
            style={{ background: "#0a0f1e", border: "1px solid #243050", borderRadius: 6, padding: "6px 10px", color: "#ffffff", fontSize: 13, fontFamily: "'Geist', sans-serif", outline: "none", cursor: "pointer" }}>
            {predictions.map(p => <option key={p.keyword} value={p.keyword}>{p.keyword}</option>)}
          </select>
        </div>

        {timeline.length > 0 ? (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160 }}>
              {timeline.map((point, i) => {
                const h = Math.max(4, (point.score / maxScore) * 150);
                const isPeak = point.score === Math.max(...timeline.map(t => t.score));
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    {isPeak && <div style={{ fontSize: 9, color: "#fbbf24", fontWeight: 600, letterSpacing: "0.05em" }}>PEAK</div>}
                    <div style={{ width: "100%", height: h + "px", background: isPeak ? "#ffffff" : i > timeline.length / 2 ? "#1a2540" : "#243050", borderRadius: "3px 3px 1px 1px", transition: "height 0.6s ease" }} />
                    <div style={{ fontSize: 9, color: "#243050", textAlign: "center" }}>{point.month?.split(" ")[0]}</div>
                    <div style={{ fontSize: 9, color: "#8aabdd" }}>{point.score}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 20 }}>
              {[
                { label: "Trend Phase", value: selectedPred?.trendPhase, color: PHASE_COLORS[selectedPred?.trendPhase] || "#ffffff" },
                { label: "Peak Month", value: selectedPred?.peakMonth, color: "#ffffff" },
                { label: "Sustained Until", value: selectedPred?.sustainedUntil, color: "#22d3ee" },
                { label: "Sustainability", value: (selectedPred?.sustainabilityScore || 0) + "%", color: "#4ade80" },
              ].map((stat, i) => (
                <div key={i} style={{ background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "#8aabdd", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", color: "#1a2540", padding: 40, fontSize: 13 }}>No timeline data available</div>
        )}
      </div>

      {/* Sustainability Rings */}
      <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 28 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 24 }}>
          Sustainability Comparison
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {predictions.map((p, i) => (
            <div key={i} style={{ flex: 1, minWidth: 120, textAlign: "center" }}>
              <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 12px" }}>
                <svg viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#1a2540" strokeWidth="6" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth="6"
                    strokeDasharray={`${(p.sustainabilityScore || 0) * 2.01} 201`} strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "#ffffff" }}>
                  {p.sustainabilityScore || 0}%
                </div>
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 14, color: "#ffffff", marginBottom: 4 }}>{p.keyword}</div>
              <div style={{ fontSize: 11, color: "#8aabdd" }}>until {p.sustainedUntil}</div>
              <div style={{ fontSize: 11, color: PHASE_COLORS[p.trendPhase] || "#8aabdd", marginTop: 3 }}>{p.trendPhase}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}