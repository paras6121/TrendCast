import { useState } from "react";

const DIRECTION_COLOR = {
  RISING: "#4ade80",
  STABLE: "#fbbf24",
  DECLINING: "#f87171",
};

const DIRECTION_ARROW = {
  RISING: "↑",
  STABLE: "→",
  DECLINING: "↓",
};

const MOMENTUM_COLOR = {
  EXPLOSIVE: "#ff6b6b",
  HIGH: "#4ade80",
  MEDIUM: "#fbbf24",
  LOW: "#8aabdd",
};

export default function CategoryIntelligence() {
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  async function analyze() {
    if (!category.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const token = localStorage.getItem("tc_token");
const res = await fetch("https://trendcast-backend.onrender.com/api/category-intelligence", {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({ category }),
});
      if (!res.ok) throw new Error("Server error: " + res.status);
      const result = await res.json();
      setData(result.intelligence);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Search */}
      <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 12 }}>
          Category Intelligence — Deep Dive
        </div>
        <div style={{ fontSize: 13, color: "#4a5a7a", marginBottom: 16 }}>
          Enter a broad category to get fits, colors, fabrics and price segments that are trending right now
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={category}
            onChange={e => setCategory(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            placeholder="e.g. bottomwear, kurtas, dresses, menswear, ethnic wear..."
            style={{ flex: 1, background: "#0a0f1e", border: "1px solid #243050", borderRadius: 8, padding: "10px 14px", color: "#ffffff", fontSize: 14, outline: "none", fontFamily: "'Geist', sans-serif" }}
            onFocus={e => (e.target.style.borderColor = "#ffffff")}
            onBlur={e => (e.target.style.borderColor = "#243050")}
          />
          <button onClick={analyze} disabled={loading || !category.trim()}
            style={{ padding: "10px 24px", background: loading ? "#111d35" : "#ffffff", color: loading ? "#8aabdd" : "#0a0f1e", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
            {loading ? "Analyzing..." : "Deep Dive →"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {["Bottomwear", "Kurtas", "Dresses", "Menswear", "Ethnic wear", "Activewear", "Denims", "Co-ord sets"].map(s => (
            <button key={s} onClick={() => { setCategory(s); }}
              style={{ background: "#111d35", border: "1px solid #1a2540", borderRadius: 16, padding: "5px 12px", color: "#8aabdd", fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#ffffff"; e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.color = "#8aabdd"; }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: "#1a0a0a", border: "1px solid #3a1515", borderRadius: 10, padding: "14px 18px", color: "#f87171", fontSize: 14, marginBottom: 16 }}>{error}</div>
      )}

      {loading && (
        <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 40, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffffff", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
            ))}
          </div>
          <div style={{ fontSize: 14, color: "#8aabdd" }}>Analyzing {category} category across all sources...</div>
        </div>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Summary */}
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 12 }}>Category Overview — {data.category}</div>
            <p style={{ fontSize: 15, color: "#ffffff", lineHeight: 1.6, fontFamily: "'Instrument Serif', serif", marginBottom: 12 }}>{data.summary}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#8aabdd" }}>
                👥 {data.targetAudience}
              </div>
              <div style={{ background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#fbbf24" }}>
                🗓 {data.seasonalNote}
              </div>
            </div>
          </div>

          {/* Peaking Now */}
          {data.peakingNow?.length > 0 && (
            <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Peaking Right Now</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.peakingNow.map((item, i) => (
                  <div key={i} style={{ background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: MOMENTUM_COLOR[item.momentum] + '22', border: "1px solid " + MOMENTUM_COLOR[item.momentum] + '44', borderRadius: 6, padding: "3px 8px", fontSize: 10, color: MOMENTUM_COLOR[item.momentum], fontWeight: 600, whiteSpace: "nowrap" }}>
                      {item.momentum}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 500, marginBottom: 2 }}>{item.item}</div>
                      <div style={{ fontSize: 12, color: "#4a5a7a" }}>{item.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fits + Colors side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Fits */}
            {data.fits?.length > 0 && (
              <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Fit Trends</div>
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
                      <div style={{ background: "#1a2540", borderRadius: 4, height: 6, overflow: "hidden" }}>
                        <div style={{ width: fit.trendScore + "%", height: "100%", background: DIRECTION_COLOR[fit.direction], borderRadius: 4, transition: "width 0.8s ease" }} />
                      </div>
                      {fit.note && <div style={{ fontSize: 11, color: "#2a3a5a", marginTop: 3 }}>{fit.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {data.colors?.length > 0 && (
              <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Color Trends</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.colors.sort((a, b) => b.trendScore - a.trendScore).map((color, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: color.hex, border: "1px solid #1a2540", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 500 }}>{color.name}</span>
                            <span style={{ fontSize: 11, color: DIRECTION_COLOR[color.direction] }}>{DIRECTION_ARROW[color.direction]}</span>
                          </div>
                          <span style={{ fontSize: 11, color: "#4a5a7a" }}>{color.peakMonth}</span>
                        </div>
                        <div style={{ background: "#1a2540", borderRadius: 3, height: 4, overflow: "hidden" }}>
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

          {/* Fabrics + Price Segments */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Fabrics */}
            {data.fabrics?.length > 0 && (
              <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Fabric Trends</div>
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
                      <div style={{ background: "#1a2540", borderRadius: 4, height: 5 }}>
                        <div style={{ width: fabric.trendScore + "%", height: "100%", background: DIRECTION_COLOR[fabric.direction], borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Segments */}
            {data.priceSegments?.length > 0 && (
              <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Price Segment Demand</div>
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
                        <div style={{ background: "#1a2540", borderRadius: 4, height: 5 }}>
                          <div style={{ width: demandWidth + "%", height: "100%", background: demandColor, borderRadius: 4 }} />
                        </div>
                        {seg.note && <div style={{ fontSize: 11, color: "#2a3a5a", marginTop: 2 }}>{seg.note}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Retailer Action */}
          {data.topRetailerAction && (
            <div style={{ background: "#0a1428", border: "1px solid #1a3a5a", borderRadius: 16, padding: 20, display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>💡</div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 6 }}>Top Retailer Action</div>
                <div style={{ fontSize: 14, color: "#ffffff", lineHeight: 1.5 }}>{data.topRetailerAction}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}