import { useState, useEffect } from "react";

const API = "https://trendcast-backend.onrender.com";

export default function Watchlist({ onPredict }) {
  const [items, setItems] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  function getToken() {
    return localStorage.getItem("tc_token");
  }

  async function fetchWatchlist() {
    try {
      const res = await fetch(`${API}/api/watchlist`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Watchlist fetch error:", err);
    }
  }

  async function addKeyword() {
    if (!newKeyword.trim()) return;
    setLoading(true);
    try {
      await fetch(`${API}/api/watchlist/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ keyword: newKeyword.trim() }),
      });
      setNewKeyword("");
      fetchWatchlist();
    } catch (err) {
      console.error("Add error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function removeKeyword(id) {
    try {
      await fetch(`${API}/api/watchlist/` + id, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      fetchWatchlist();
    } catch (err) {
      console.error("Remove error:", err);
    }
  }

  const getTrendColor = (trend) => {
    if (!trend) return "#8aabdd";
    if (trend.includes("RISING")) return "#4ade80";
    if (trend.includes("FALLING")) return "#f87171";
    return "#fbbf24";
  };

  const getTrendArrow = (trend) => {
    if (!trend) return "→";
    if (trend.includes("RAPIDLY_RISING")) return "↑↑";
    if (trend.includes("RISING")) return "↑";
    if (trend.includes("RAPIDLY_FALLING")) return "↓↓";
    if (trend.includes("FALLING")) return "↓";
    return "→";
  };

  return (
    <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 4 }}>Watchlist</div>
          <div style={{ fontSize: 13, color: "#4a5a7a" }}>Track keywords and monitor weekly score changes</div>
        </div>
        <div style={{ background: "#111d35", border: "1px solid #1a2540", borderRadius: 8, padding: "4px 12px", fontSize: 12, color: "#8aabdd" }}>
          {items.length} tracked
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={newKeyword}
          onChange={e => setNewKeyword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addKeyword()}
          placeholder="Add keyword to watch..."
          style={{ flex: 1, background: "#0a0f1e", border: "1px solid #243050", borderRadius: 8, padding: "9px 12px", color: "#ffffff", fontSize: 13, outline: "none", fontFamily: "'Geist', sans-serif" }}
          onFocus={e => (e.target.style.borderColor = "#ffffff")}
          onBlur={e => (e.target.style.borderColor = "#243050")}
        />
        <button onClick={addKeyword} disabled={loading || !newKeyword.trim()}
          style={{ padding: "9px 16px", background: loading ? "#111d35" : "#ffffff", color: loading ? "#8aabdd" : "#0a0f1e", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}>
          + Add
        </button>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "#2a3a5a", fontSize: 13 }}>
          No keywords watched yet. Add some above!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>{item.keyword}</span>
                  {item.lastTrend && (
                    <span style={{ fontSize: 12, color: getTrendColor(item.lastTrend), fontWeight: 600 }}>
                      {getTrendArrow(item.lastTrend)} {item.lastTrend?.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                {item.lastScore !== null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, background: "#1a2540", borderRadius: 3, height: 4 }}>
                      <div style={{ width: (item.lastScore || 0) + "%", height: "100%", background: "#ffffff", borderRadius: 3, transition: "width 0.8s ease" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#8aabdd", minWidth: 40 }}>{item.lastScore}/100</span>
                  </div>
                )}
                {item.history && item.history.length > 1 && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20, marginTop: 6 }}>
                    {item.history.slice(-8).map((h, i) => (
                      <div key={i} title={"Score: " + h.score}
                        style={{ flex: 1, height: Math.max(2, (h.score / 100) * 18) + "px", background: i === item.history.slice(-8).length - 1 ? "#ffffff" : "#243050", borderRadius: "1px 1px 0 0" }} />
                    ))}
                  </div>
                )}
                {item.lastChecked && (
                  <div style={{ fontSize: 10, color: "#2a3a5a", marginTop: 4 }}>
                    Last checked: {new Date(item.lastChecked).toLocaleDateString('en-IN')}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => onPredict([item.keyword])}
                  style={{ padding: "6px 12px", background: "#111d35", border: "1px solid #1a2540", borderRadius: 6, color: "#8aabdd", fontSize: 11, cursor: "pointer", fontFamily: "'Geist', sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#ffffff"; e.currentTarget.style.color = "#ffffff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.color = "#8aabdd"; }}>
                  Predict
                </button>
                <button onClick={() => removeKeyword(item.id)}
                  style={{ padding: "6px 10px", background: "none", border: "1px solid #1a2540", borderRadius: 6, color: "#3a4a6a", fontSize: 11, cursor: "pointer", fontFamily: "'Geist', sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#f87171"; e.currentTarget.style.color = "#f87171"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.color = "#3a4a6a"; }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}