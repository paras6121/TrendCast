import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://trendcast-backend.onrender.com";

const DIRECTION_COLOR = { RISING: "#4ade80", STABLE: "#fbbf24", DECLINING: "#f87171" };
const DIRECTION_ARROW = { RISING: "↑", STABLE: "→", DECLINING: "↓" };
const MOMENTUM_COLOR = { EXPLOSIVE: "#ff6b6b", HIGH: "#4ade80", MEDIUM: "#fbbf24", LOW: "#888888" };
const DEMAND_COLOR = { HIGH: "#4ade80", MEDIUM: "#fbbf24", LOW: "#f87171" };
const DEMAND_WIDTH = { HIGH: 85, MEDIUM: 55, LOW: 25 };

function safe(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return "";
}

export default function CategoryIntelligence({ token }) {
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState(null);

  async function analyze() {
    if (!category.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    setMeta(null);
    try {
      const res = await fetch(`${API}/api/category-intelligence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) throw new Error("Server error: " + res.status);
      const result = await res.json();
      setData(result.intelligence);
      setMeta({
        offlineSignalsUsed: result.offlineSignalsUsed,
        extractedKeywords: result.extractedKeywords,
        offlineExtraction: result.offlineExtraction,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const QUICK = ["Shirts", "Menswear", "Bottomwear", "Kurtas", "Dresses", "Ethnic wear", "Activewear", "Denims", "Co-ord sets", "Kidswear"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Search */}
      <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555555", marginBottom: 6 }}>Category Intelligence</div>
        <div style={{ fontSize: 13, color: "#444444", marginBottom: 16 }}>
          Enter any fashion category. Menswear categories use supplier data. All others use live online signals.
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input
            value={category}
            onChange={e => setCategory(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            placeholder="e.g. shirts, kurtas, dresses, menswear..."
            style={{ flex: 1, background: "#080808", border: "1px solid #1e1e1e", borderRadius: 8, padding: "10px 14px", color: "#ffffff", fontSize: 14, outline: "none", fontFamily: "'Geist', sans-serif" }}
            onFocus={e => (e.target.style.borderColor = "#ffffff")}
            onBlur={e => (e.target.style.borderColor = "#1e1e1e")}
          />
          <button onClick={analyze} disabled={loading || !category.trim()}
            style={{ padding: "10px 24px", background: loading ? "#1a1a1a" : "#ffffff", color: loading ? "#555555" : "#080808", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
            {loading ? "Analyzing..." : "Deep Dive →"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK.map(s => (
            <button key={s} onClick={() => setCategory(s)}
              style={{ background: "#111111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "5px 12px", color: "#666666", fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#ffffff"; e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#666666"; }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#1a0a0a", border: "1px solid #3a1515", borderRadius: 10, padding: "14px 18px", color: "#f87171", fontSize: 14 }}>{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 40, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffffff", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
            ))}
          </div>
          <div style={{ fontSize: 14, color: "#555555", marginBottom: 6 }}>
            {meta?.offlineSignalsUsed ? "Supplier data detected — guiding search..." : "Scanning online sources..."}
          </div>
          <div style={{ fontSize: 12, color: "#333333" }}>Analyzing {category} category</div>
        </div>
      )}

      {/* Results */}
      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Data quality */}
          {safe(data.dataQuality) === "OFFLINE_VALIDATED" ? (
            <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🧵</span>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4ade80", fontWeight: 600, marginBottom: 4 }}>Supply Chain Validated</div>
                <div style={{ fontSize: 13, color: "#4a7a4a", lineHeight: 1.5 }}>{safe(data.offlineSummary)}</div>
              </div>
            </div>
          ) : (
            <div style={{ background: "#111111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>📡</span>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555555", fontWeight: 600, marginBottom: 4 }}>Online Data Only</div>
                <div style={{ fontSize: 13, color: "#444444", lineHeight: 1.5 }}>{safe(data.offlineSummary)}</div>
              </div>
            </div>
          )}

          {/* Extracted keywords used */}
          {meta?.extractedKeywords?.length > 0 && (
            <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 10, padding: "10px 16px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#333333", textTransform: "uppercase", letterSpacing: "0.1em" }}>Searched:</span>
              {meta.extractedKeywords.map((kw, i) => (
                <span key={i} style={{ fontSize: 11, background: "#111111", border: "1px solid #1e1e1e", borderRadius: 4, padding: "2px 8px", color: "#555555" }}>{kw}</span>
              ))}
            </div>
          )}

          {/* Summary */}
          <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555555", marginBottom: 10 }}>
              Overview — {safe(data.category)}
            </div>
            <p style={{ fontSize: 15, color: "#ffffff", lineHeight: 1.7, fontFamily: "'Instrument Serif', serif", marginBottom: 16 }}>
              {safe(data.summary)}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {data.targetAudience && (
                <div style={{ background: "#111111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#666666" }}>
                  👥 {safe(data.targetAudience)}
                </div>
              )}
              {data.seasonalNote && (
                <div style={{ background: "#111111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#666666" }}>
                  🗓 {safe(data.seasonalNote)}
                </div>
              )}
            </div>
          </div>

          {/* Peaking Now */}
          {Array.isArray(data.peakingNow) && data.peakingNow.length > 0 && (
            <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555555", marginBottom: 16 }}>Peaking Right Now</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.peakingNow.map((item, i) => {
                  const momentum = safe(item.momentum);
                  const classification = safe(item.classification);
                  const classColor = classification === "STRONG" ? "#4ade80" : classification === "EMERGING" ? "#fbbf24" : "#888888";
                  const classBg = classification === "STRONG" ? "#0a1a0a" : classification === "EMERGING" ? "#1a1a0a" : "#111111";
                  const classBorder = classification === "STRONG" ? "#1a3a1a" : classification === "EMERGING" ? "#3a3010" : "#1e1e1e";
                  return (
                    <div key={i} style={{ background: "#111111", border: "1px solid #1e1e1e", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ background: (MOMENTUM_COLOR[momentum] || "#888") + "22", border: `1px solid ${(MOMENTUM_COLOR[momentum] || "#888")}44`, borderRadius: 6, padding: "3px 8px", fontSize: 10, color: MOMENTUM_COLOR[momentum] || "#888", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
                        {momentum}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>{safe(item.item)}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: classBg, color: classColor, border: `1px solid ${classBorder}` }}>
                            {classification}
                          </span>
                          {item.offlineBacked && (
                            <span style={{ fontSize: 10, color: "#4ade80", background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 4, padding: "2px 8px" }}>🧵 Supplier</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#555555", lineHeight: 1.5 }}>{safe(item.reason)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fits + Colors */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>

            {/* Fits */}
            {Array.isArray(data.fits) && data.fits.length > 0 && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555555", marginBottom: 16 }}>Fit Trends</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[...data.fits].sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0)).map((fit, i) => {
                    const dir = safe(fit.direction);
                    const score = typeof fit.trendScore === "number" ? fit.trendScore : 0;
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 500 }}>{safe(fit.name)}</span>
                            <span style={{ fontSize: 12, color: DIRECTION_COLOR[dir] || "#888" }}>{DIRECTION_ARROW[dir] || "→"}</span>
                            {fit.offlineBacked && <span style={{ fontSize: 9, color: "#4ade80" }}>🧵</span>}
                          </div>
                          <span style={{ fontSize: 13, color: DIRECTION_COLOR[dir] || "#888", fontWeight: 600 }}>{score}</span>
                        </div>
                        <div style={{ background: "#1e1e1e", borderRadius: 4, height: 6, overflow: "hidden" }}>
                          <div style={{ width: score + "%", height: "100%", background: DIRECTION_COLOR[dir] || "#888", borderRadius: 4 }} />
                        </div>
                        {fit.note && <div style={{ fontSize: 11, color: "#333333", marginTop: 3 }}>{safe(fit.note)}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            {Array.isArray(data.colors) && data.colors.length > 0 && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555555", marginBottom: 16 }}>Color Trends</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...data.colors].sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0)).map((color, i) => {
                    const dir = safe(color.direction);
                    const score = typeof color.trendScore === "number" ? color.trendScore : 0;
                    const hex = safe(color.hex) || "#888888";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: hex, border: "1px solid #1e1e1e", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 500 }}>{safe(color.name)}</span>
                              <span style={{ fontSize: 11, color: DIRECTION_COLOR[dir] || "#888" }}>{DIRECTION_ARROW[dir] || "→"}</span>
                              {color.offlineBacked && <span style={{ fontSize: 9, color: "#4ade80" }}>🧵</span>}
                            </div>
                            <span style={{ fontSize: 11, color: "#444444" }}>{safe(color.peakMonth)}</span>
                          </div>
                          <div style={{ background: "#1e1e1e", borderRadius: 3, height: 4, overflow: "hidden" }}>
                            <div style={{ width: score + "%", height: "100%", background: hex, borderRadius: 3 }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: DIRECTION_COLOR[dir] || "#888", fontWeight: 600, minWidth: 24, textAlign: "right" }}>{score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Fabrics + Price */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>

            {/* Fabrics */}
            {Array.isArray(data.fabrics) && data.fabrics.length > 0 && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555555", marginBottom: 16 }}>Fabric Trends</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[...data.fabrics].sort((a, b) => (b.trendScore || 0) - (a.trendScore || 0)).map((fabric, i) => {
                    const dir = safe(fabric.direction);
                    const score = typeof fabric.trendScore === "number" ? fabric.trendScore : 0;
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 13, color: "#ffffff" }}>{safe(fabric.name)}</span>
                            <span style={{ fontSize: 12, color: DIRECTION_COLOR[dir] || "#888" }}>{DIRECTION_ARROW[dir] || "→"}</span>
                            {fabric.offlineBacked && <span style={{ fontSize: 9, color: "#4ade80" }}>🧵</span>}
                          </div>
                          <span style={{ fontSize: 12, color: DIRECTION_COLOR[dir] || "#888", fontWeight: 600 }}>{score}</span>
                        </div>
                        <div style={{ background: "#1e1e1e", borderRadius: 4, height: 5 }}>
                          <div style={{ width: score + "%", height: "100%", background: DIRECTION_COLOR[dir] || "#888", borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Segments */}
            {Array.isArray(data.priceSegments) && data.priceSegments.length > 0 && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555555", marginBottom: 16 }}>Price Segment Demand</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.priceSegments.map((seg, i) => {
                    const demand = safe(seg.demand);
                    const dColor = DEMAND_COLOR[demand] || "#888";
                    const dWidth = DEMAND_WIDTH[demand] || 30;
                    return (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 13, color: "#ffffff" }}>{safe(seg.range)}</span>
                          <span style={{ fontSize: 11, color: dColor, fontWeight: 600 }}>{demand}</span>
                        </div>
                        <div style={{ background: "#1e1e1e", borderRadius: 4, height: 5 }}>
                          <div style={{ width: dWidth + "%", height: "100%", background: dColor, borderRadius: 4 }} />
                        </div>
                        {seg.note && <div style={{ fontSize: 11, color: "#333333", marginTop: 2 }}>{safe(seg.note)}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Retailer Action */}
          {data.topRetailerAction && (
            <div style={{ background: "#080808", border: "1px solid #1e1e1e", borderRadius: 14, padding: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>💡</span>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555555", marginBottom: 6 }}>Top Retailer Action</div>
                <div style={{ fontSize: 14, color: "#ffffff", lineHeight: 1.6 }}>{safe(data.topRetailerAction)}</div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}