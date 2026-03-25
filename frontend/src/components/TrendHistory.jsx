export default function TrendHistory({ rawScores, predictions }) {
  if (!rawScores || rawScores.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {rawScores.map((raw, i) => {
        const pred = predictions?.find(p => p.keyword === raw.keyword);
        const timeline = pred?.trendTimeline || [];
        const maxVal = Math.max(...timeline.map(t => t.score), 1);

        return (
          <div key={i} style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#ffffff", marginBottom: 6 }}>{raw.keyword}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, background: "#111d35", color: "#8aabdd", padding: "3px 8px", borderRadius: 4 }}>
                    Score: {raw.compositeScore}/100
                  </span>
                  {pred?.trendPhase && (
                    <span style={{ fontSize: 11, background: "#0a1a24", color: "#22d3ee", padding: "3px 8px", borderRadius: 4 }}>
                      {pred.trendPhase}
                    </span>
                  )}
                </div>
              </div>
              {pred && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#2a3a5a", marginBottom: 4 }}>Sustained until</div>
                  <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>{pred.sustainedUntil || "TBD"}</div>
                </div>
              )}
            </div>

            {timeline.length > 0 ? (
              <div>
                <div style={{ fontSize: 11, color: "#2a3a5a", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  6-Month Trend Forecast
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100 }}>
                  {timeline.map((point, j) => {
                    const h = Math.max(4, (point.score / maxVal) * 90);
                    const isPeak = point.score === Math.max(...timeline.map(t => t.score));
                    return (
                      <div key={j} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        {isPeak && <div style={{ fontSize: 8, color: "#fbbf24", fontWeight: 600 }}>PEAK</div>}
                        <div style={{ width: "100%", height: h + "px", background: isPeak ? "#ffffff" : j > timeline.length / 2 ? "#1a2540" : "#243050", borderRadius: "2px 2px 1px 1px", transition: "height 0.6s ease" }} />
                        <div style={{ fontSize: 9, color: "#1a2540" }}>{point.month?.split(" ")[0]}</div>
                        <div style={{ fontSize: 9, color: "#2a3a5a" }}>{point.score}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#1a2540", padding: "20px 0", fontSize: 13 }}>
                No timeline data — run a prediction to see history
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
              {[
                { label: "Google Trends", value: raw.signals?.googleTrends?.trend || "—", color: "#8aabdd" },
                { label: "Amazon Signal", value: raw.signals?.amazon?.demandSignal || "—", color: "#fbbf24" },
                { label: "Reddit Posts", value: (raw.signals?.reddit?.totalPosts || 0) + " posts", color: "#a78bfa" },
              ].map((stat, k) => (
                <div key={k} style={{ background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: "#2a3a5a", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</div>
                  <div style={{ fontSize: 13, color: stat.color, fontWeight: 500 }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}