import { useState } from "react";

const CONFIDENCE = {
  HIGH: { bg: "#0a1f0a", border: "#1a3a1a", text: "#4ade80", label: "HIGH" },
  MEDIUM: { bg: "#1f1a0a", border: "#3a3010", text: "#fbbf24", label: "MED" },
  LOW: { bg: "#1f0a0a", border: "#3a1515", text: "#f87171", label: "LOW" },
};

const PHASE = {
  EMERGING: { color: "#22d3ee", bg: "#0a1a24" },
  GROWING: { color: "#a78bfa", bg: "#10102a" },
  PEAK: { color: "#fbbf24", bg: "#1f1a0a" },
  DECLINING: { color: "#f87171", bg: "#1f0a0a" },
  DEAD: { color: "#6b7280", bg: "#111d35" },
};

export default function TrendCard({ prediction, rawScore }) {
  const [showSources, setShowSources] = useState(false);
  const conf = CONFIDENCE[prediction.confidence] || CONFIDENCE.MEDIUM;
  const phase = PHASE[prediction.trendPhase] || PHASE.GROWING;
  const timeline = prediction.trendTimeline || [];
  const maxVal = Math.max(...timeline.map(t => t.score), 1);
  const weeklyChange = rawScore?.signals?.googleTrends?.weeklyChange || 0;

  return (
    <div
      style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}
      onMouseEnter={e => (e.currentTarget.style.border = "1px solid #2a3a5a")}
      onMouseLeave={e => (e.currentTarget.style.border = "1px solid #1a2540")}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {prediction.keyword}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, background: phase.bg, color: phase.color, padding: "3px 8px", borderRadius: 4, fontWeight: 500 }}>
              {prediction.trendPhase || "GROWING"}
            </span>
            {prediction.targetAudience && (
              <span style={{ fontSize: 11, background: "#111d35", color: "#8aabdd", padding: "3px 8px", borderRadius: 4 }}>
                {prediction.targetAudience}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{ fontSize: 11, background: conf.bg, color: conf.text, border: "1px solid " + conf.border, padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>
            {conf.label}
          </span>
          {weeklyChange !== 0 && (
            <span style={{ fontSize: 12, color: weeklyChange > 0 ? "#4ade80" : "#f87171", fontWeight: 500 }}>
              {weeklyChange > 0 ? "↑" : "↓"} {Math.abs(weeklyChange)}%
            </span>
          )}
        </div>
      </div>

      {/* Mini Timeline */}
      {timeline.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "#8aabdd", marginBottom: 8 }}>6-month forecast</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 44 }}>
            {timeline.map((point, i) => {
              const h = Math.max(4, (point.score / maxVal) * 40);
              const isPeak = point.score === Math.max(...timeline.map(t => t.score));
              return (
                <div key={i} title={point.month + ": " + point.score}
                  style={{ flex: 1, height: h + "px", background: isPeak ? "#ffffff" : i > timeline.length / 2 ? "#1a2540" : "#243050", borderRadius: "2px 2px 1px 1px" }} />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 10, color: "#1a2540" }}>{timeline[0]?.month?.split(" ")[0]}</span>
            <span style={{ fontSize: 10, color: "#ffffff", fontWeight: 500 }}>peak {prediction.peakMonth?.split(" ")[0]}</span>
            <span style={{ fontSize: 10, color: "#1a2540" }}>{timeline[timeline.length - 1]?.month?.split(" ")[0]}</span>
          </div>
        </div>
      )}

      {/* Score */}
      {rawScore && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#8aabdd" }}>Trend score</span>
            <span style={{ fontSize: 12, color: "#ffffff", fontWeight: 500 }}>{rawScore.compositeScore}/100</span>
          </div>
          <div style={{ background: "#1a2540", borderRadius: 4, height: 5 }}>
            <div style={{ width: rawScore.compositeScore + "%", height: "100%", background: "#ffffff", borderRadius: 4 }} />
          </div>
        </div>
      )}

      {/* Sustainability */}
      {prediction.sustainabilityScore && (
        <div style={{ background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "#8aabdd", marginBottom: 3 }}>Sustained until</div>
            <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>{prediction.sustainedUntil}</div>
          </div>
          <div style={{ position: "relative", width: 48, height: 48 }}>
            <svg viewBox="0 0 48 48" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="24" cy="24" r="20" fill="none" stroke="#1a2540" strokeWidth="4" />
              <circle cx="24" cy="24" r="20" fill="none" stroke="#ffffff" strokeWidth="4"
                strokeDasharray={`${(prediction.sustainabilityScore / 100) * 125.6} 125.6`}
                strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#ffffff", fontWeight: 600 }}>
              {prediction.sustainabilityScore}%
            </div>
          </div>
        </div>
      )}

      {/* Prediction */}
      <p style={{ fontSize: 14, color: "#aabbd4", lineHeight: 1.65 }}>{prediction.prediction}</p>

      {/* Price Range */}
      {prediction.priceRange && (
        <div style={{ fontSize: 12, color: "#8aabdd" }}>
          Price range: <span style={{ color: "#ffffff", fontWeight: 500 }}>{prediction.priceRange}</span>
        </div>
      )}

      {/* Colors */}
      {prediction.colors?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#243050", marginBottom: 10 }}>Trending Colors</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {prediction.colors.map((color, i) => {
              const dirColor = color.direction === 'RISING' ? "#4ade80" : color.direction === 'DECLINING' ? "#f87171" : "#fbbf24";
              const dirArrow = color.direction === 'RISING' ? "↑" : color.direction === 'DECLINING' ? "↓" : "→";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 5, background: color.hex, border: "1px solid #1a2540", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 12, color: "#ffffff" }}>{color.name}</span>
                        <span style={{ fontSize: 11, color: dirColor }}>{dirArrow}</span>
                      </div>
                      <span style={{ fontSize: 11, color: dirColor, fontWeight: 600 }}>{color.trendScore}</span>
                    </div>
                    <div style={{ background: "#1a2540", borderRadius: 3, height: 3 }}>
                      <div style={{ width: (color.trendScore || 0) + "%", height: "100%", background: color.hex, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Segments */}
      {prediction.priceSegments?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#243050", marginBottom: 10 }}>Price Segment Demand</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {prediction.priceSegments.map((seg, i) => {
              const demandColor = seg.demand === 'HIGH' ? "#4ade80" : seg.demand === 'MEDIUM' ? "#fbbf24" : "#f87171";
              const demandWidth = seg.demand === 'HIGH' ? 85 : seg.demand === 'MEDIUM' ? 55 : 25;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: "#aabbd4" }}>{seg.range}</span>
                    <span style={{ fontSize: 11, color: demandColor, fontWeight: 600 }}>{seg.demand}</span>
                  </div>
                  <div style={{ background: "#1a2540", borderRadius: 3, height: 4 }}>
                    <div style={{ width: demandWidth + "%", height: "100%", background: demandColor, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drivers */}
      <div style={{ borderTop: "1px solid #1a2540", paddingTop: 14 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#243050", marginBottom: 10 }}>Key Drivers</div>
        {prediction.drivers?.map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
            <span style={{ color: "#8aabdd", fontSize: 14, flexShrink: 0, marginTop: 1 }}>→</span>
            <span style={{ fontSize: 13, color: "#aabbd4", lineHeight: 1.5 }}>{d}</span>
          </div>
        ))}
      </div>

      {/* Retailer Action */}
      <div style={{ background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 10, padding: "12px 16px" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#243050", marginBottom: 6 }}>Retailer Action</div>
        <p style={{ fontSize: 13, color: "#aabbd4", lineHeight: 1.55 }}>{prediction.retailerAction}</p>
      </div>

      {/* Sources */}
      {rawScore?.signals && (
        <>
          <button onClick={() => setShowSources(!showSources)}
            style={{ background: "none", border: "1px solid #1a2540", borderRadius: 6, padding: "7px 12px", color: "#8aabdd", fontSize: 11, cursor: "pointer", fontFamily: "'Geist', sans-serif", width: "100%" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#ffffff"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.color = "#8aabdd"; }}
          >
            {showSources ? "Hide" : "View"} source breakdown
          </button>

          {showSources && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(rawScore.signals).map(([source, data]) => {
                const val = data.totalResults ?? data.thisWeekScore ?? data.tweetCount ?? data.totalProducts ?? data.searchVolume ?? 0;
                const note = data.weeklyNote || '';
                const hasData = val > 0;
                return (
                  <div key={source}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: hasData ? "#ffffff" : "#1a2540", textTransform: "capitalize" }}>
                        {source.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span style={{ fontSize: 11, color: hasData ? "#8aabdd" : "#1a2540" }}>
                        {note || (hasData ? val : "no data")}
                      </span>
                    </div>
                    <div style={{ background: "#1a2540", borderRadius: 3, height: 3 }}>
                      <div style={{ width: Math.min(100, val) + "%", height: "100%", background: "#ffffff", borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {prediction.timeframeNote && (
        <div style={{ fontSize: 10, color: "#1a2540", fontStyle: "italic" }}>{prediction.timeframeNote}</div>
      )}
    </div>
  );
}