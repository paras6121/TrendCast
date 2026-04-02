import { useState } from "react";

const DIRECTION_COLOR = { RISING: "#4ade80", STABLE: "#fbbf24", DECLINING: "#f87171" };
const DIRECTION_ARROW = { RISING: "↑", STABLE: "→", DECLINING: "↓" };
const MOMENTUM_COLOR = { EXPLOSIVE: "#ff6b6b", HIGH: "#4ade80", MEDIUM: "#fbbf24", LOW: "#888888" };

export default function CategoryIntelligence() {
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  async function analyze() {
    if (!category.trim()) return;
    setLoading(true); setError(null); setData(null);
    try {
      const tk = localStorage.getItem("tc_token");
      const res = await fetch("https://trendcast-backend.onrender.com/api/category-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + tk },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) throw new Error("Server error: " + res.status);
      const result = await res.json();
      setData(result.intelligence);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Category Intelligence — Deep Dive</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>Enter a broad category to get fits, colors, fabrics and price segments trending right now</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={category} onChange={e => setCategory(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            onKeyUp={e => e.key === "Enter" && analyze()}
            placeholder="e.g. bottomwear, kurtas, dresses, menswear..."
            autoCapitalize="none" autoCorrect="off" autoComplete="off"
            style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "11px 14px", color: "#ffffff", fontSize: 14, outline: "none", fontFamily: "'Geist', sans-serif", WebkitAppearance: "none" }}
            onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
          <button onClick={analyze} disabled={loading || !category.trim()}
            style={{ padding: "11px 20px", background: category.trim() && !loading ? "#ffffff" : "rgba(255,255,255,0.06)", color: category.trim() && !loading ? "#0a0a0a" : "rgba(255,255,255,0.3)", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: category.trim() && !loading ? "pointer" : "not-allowed", whiteSpace: "nowrap", flexShrink: 0, WebkitAppearance: "none", touchAction: "manipulation" }}>
            {loading ? "Analyzing..." : "Deep Dive →"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {["Bottomwear", "Kurtas", "Dresses", "Menswear", "Ethnic wear", "Activewear", "Denims", "Co-ord sets"].map(s => (
            <button key={s} onClick={() => setCategory(s)}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "5px 12px", color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer", touchAction: "manipulation" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 10, padding: "14px 18px", color: "#f87171", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {loading && (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 40, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#ffffff", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Analyzing {category} across all sources...</div>
        </div>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>Category Overview — {data.category}</div>
            <p style={{ fontSize: 15, color: "#ffffff", lineHeight: 1.6, marginBottom: 12 }}>{data.summary}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>👥 {data.targetAudience}</div>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#fbbf24" }}>🗓 {data.seasonalNote}</div>
            </div>
          </div>

          {data.peakingNow?.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>Peaking Right Now</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.peakingNow.map((item, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
```jsx
<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
  <div style={{ background: MOMENTUM_COLOR[item.momentum] + '18', border: "1px solid " + MOMENTUM_COLOR[item.momentum] + '35', borderRadius: 6, padding: "3px 8px", fontSize: 10, color: MOMENTUM_COLOR[item.momentum], fontWeight: 600, whiteSpace: "nowrap" }}>
    {item.momentum}
  </div>

  <div style={{
    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
    background: item.classification === 'STRONG' ? '#0a1a0a' : item.classification === 'EMERGING' ? '#1a1a0a' : '#0f0f0f',
    color: item.classification === 'STRONG' ? '#4ade80' : item.classification === 'EMERGING' ? '#fbbf24' : '#888888',
    border: `1px solid ${item.classification === 'STRONG' ? '#1a3a1a' : item.classification === 'EMERGING' ? '#3a3010' : '#1e1e1e'}`,
  }}>
    {item.classification}
  </div>

  {item.offlineBacked && (
    <div style={{ fontSize: 10, color: "#4ade80", background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 4, padding: "2px 8px" }}>
      🧵 Supplier
    </div>
  )}
</div>


                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 500, marginBottom: 2 }}>{item.item}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{item.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {data.fits?.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>Fit Trends</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.fits.sort((a, b) => b.trendScore - a.trendScore).map((fit, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 500 }}>{fit.name}</span>
                          <span style={{ fontSize: 12, color: DIRECTION_COLOR[fit.direction] }}>{DIRECTION_ARROW[fit.direction]}</span>
                        </div>
                        <span style={{ fontSize: 13, color: DIRECTION_COLOR[fit.direction], fontWeight: 600 }}>{fit.trendScore}</span>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 5, overflow: "hidden" }}>
                        <div style={{ width: fit.trendScore + "%", height: "100%", background: DIRECTION_COLOR[fit.direction], borderRadius: 4, transition: "width 0.8s ease" }} />
                      </div>
                      {fit.note && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>{fit.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.colors?.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>Color Trends</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.colors.sort((a, b) => b.trendScore - a.trendScore).map((color, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: color.hex, border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 500 }}>{color.name}</span>
                            <span style={{ fontSize: 11, color: DIRECTION_COLOR[color.direction] }}>{DIRECTION_ARROW[color.direction]}</span>
                          </div>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{color.peakMonth}</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 3, height: 4, overflow: "hidden" }}>
                          <div style={{ width: color.trendScore + "%", height: "100%", background: color.hex, borderRadius: 3 }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: DIRECTION_COLOR[color.direction], fontWeight: 600, minWidth: 24, textAlign: "right" }}>{color.trendScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {data.fabrics?.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>Fabric Trends</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.fabrics.sort((a, b) => b.trendScore - a.trendScore).map((fabric, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, color: "#ffffff" }}>{fabric.name}</span>
                          <span style={{ fontSize: 12, color: DIRECTION_COLOR[fabric.direction] }}>{DIRECTION_ARROW[fabric.direction]}</span>
                        </div>
                        <span style={{ fontSize: 12, color: DIRECTION_COLOR[fabric.direction], fontWeight: 600 }}>{fabric.trendScore}</span>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 5 }}>
                        <div style={{ width: fabric.trendScore + "%", height: "100%", background: DIRECTION_COLOR[fabric.direction], borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.priceSegments?.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>Price Segment Demand</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.priceSegments.map((seg, i) => {
                    const demandColor = seg.demand === 'HIGH' ? "#4ade80" : seg.demand === 'MEDIUM' ? "#fbbf24" : "#f87171";
                    const demandWidth = seg.demand === 'HIGH' ? 85 : seg.demand === 'MEDIUM' ? 55 : 25;
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 13, color: "#ffffff" }}>{seg.range}</span>
                          <span style={{ fontSize: 11, color: demandColor, fontWeight: 600 }}>{seg.demand}</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 5 }}>
                          <div style={{ width: demandWidth + "%", height: "100%", background: demandColor, borderRadius: 4 }} />
                        </div>
                        {seg.note && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{seg.note}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {data.topRetailerAction && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>💡</div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", marginBottom: 6 }}>Top Retailer Action</div>
                <div style={{ fontSize: 14, color: "#ffffff", lineHeight: 1.5 }}>{data.topRetailerAction}</div>
              </div>
            </div>
          )}
        </div>
      )}
      {data?.dataQuality === "ONLINE_ONLY" && (
  <div style={{ background: "#111111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
    <span style={{ fontSize: 20 }}>📡</span>
    <div>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555555", fontWeight: 600, marginBottom: 4 }}>
        Online Data Only
      </div>
      <div style={{ fontSize: 13, color: "#444444", lineHeight: 1.6 }}>
        {data?.offlineSummary}
      </div>
    </div>
  </div>
)}
    </div>
  );
}