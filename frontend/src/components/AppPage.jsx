import { useState } from "react";
import KeywordInput from "./KeywordInput";
import TrendCard from "./TrendCard";
import OverallChart from "./OverallChart";
import Watchlist from "./Watchlist";
import TrendHistory from "./TrendHistory";
import CategoryIntelligence from "./CategoryIntelligence";
import PersonalizedStyling from "./PersonalizedStyling";

const API = "https://trendcast-backend.onrender.com";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; width: 100%; }
  body { background: #050810; color: #ffffff; font-family: 'Geist', sans-serif; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: #050810; }
  ::-webkit-scrollbar-thumb { background: #1a2540; border-radius: 2px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
  .fade-up { animation: fadeUp 0.5s ease both; }
  .feature-locked { position: relative; pointer-events: none; user-select: none; }
  .feature-locked::after { content: ''; position: absolute; inset: 0; background: rgba(5,8,16,0.6); backdrop-filter: blur(4px); border-radius: inherit; z-index: 10; }
  .lock-prompt { position: absolute; inset: 0; z-index: 11; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .lock-badge { background: #0a0f1e; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 20px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,0.5); font-weight: 500; }
  .app-nav { position: sticky; top: 0; z-index: 100; background: rgba(5,8,16,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0 clamp(16px,4vw,40px); display: flex; align-items: center; justify-content: space-between; height: 56px; gap: 8px; }
  .mode-tabs { display: flex; gap: 2px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 3px; }
  .mode-tab { padding: 7px 16px; border: none; border-radius: 7px; font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .mode-tab.active { background: #ffffff; color: #050810; }
  .mode-tab.inactive { background: transparent; color: rgba(255,255,255,0.4); }
  .mode-tab.inactive:hover { color: rgba(255,255,255,0.7); }
  .result-tabs { display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,0.06); overflow-x: auto; }
  .result-tab { padding: 10px 16px; border: none; background: none; font-family: 'Geist', sans-serif; font-size: 12px; cursor: pointer; white-space: nowrap; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s; }

  @media (max-width: 600px) {
    .app-nav { flex-wrap: wrap; height: auto; padding: 8px 16px; gap: 6px; }
    .mode-tabs { width: 100%; overflow-x: auto; }
    .nav-user { display: none; }
  }
`;

function LockedFeature({ children, isLoggedIn, onUnlock, label = "Sign in to use this feature" }) {
  if (isLoggedIn) return children;
  return (
    <div style={{ position: "relative" }}>
      <div className="feature-locked">{children}</div>
      <div className="lock-prompt" onClick={onUnlock}>
        <div className="lock-badge"><span>🔒</span> {label}</div>
      </div>
    </div>
  );
}

export default function AppPage({ user, token, onLogout, onLogin, onGoHome }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryItems, setCategoryItems] = useState(null);
  const [activeTab, setActiveTab] = useState("predictions");
  const [heroMode, setHeroMode] = useState("search");
  const [showWatchlist, setShowWatchlist] = useState(false);

  function authFetch(url, options = {}) {
    return fetch(`${API}${url}`, {
      ...options,
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, ...(options.headers || {}) },
    });
  }

  async function handlePredict(keywords) {
    if (!user) return;
    setLoading(true); setError(null); setResults(null); setActiveTab("predictions"); setHeroMode("search");
    try {
      const res = await authFetch("/api/predict", { method: "POST", body: JSON.stringify({ keywords }) });
      if (!res.ok) throw new Error("Server error: " + res.status);
      setResults(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleExpandCategory() {
    if (!user || !category.trim()) return;
    setCategoryLoading(true); setCategoryItems(null);
    try {
      const res = await authFetch("/api/expand-category", { method: "POST", body: JSON.stringify({ category }) });
      if (!res.ok) throw new Error("Server error: " + res.status);
      setCategoryItems(await res.json());
    } catch (err) { setError(err.message); }
    finally { setCategoryLoading(false); }
  }

  async function handleDownloadPDF() {
    if (!results || !user) return;
    try {
      const res = await authFetch("/api/download-report", { method: "POST", body: JSON.stringify({ predictions: results.predictions, rawScores: results.rawScores, keywords: results.keywords }) });
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "trendcast-report.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error("PDF error:", err); }
  }

  const SP = { paddingLeft: "clamp(16px,4vw,40px)", paddingRight: "clamp(16px,4vw,40px)" };

  return (
    <>
      <style>{G}</style>

      {/* APP NAV */}
      <nav className="app-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={onGoHome} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#ffffff"/>
              <path d="M8 20 L14 8 L20 20" stroke="#050810" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 16 L18 16" stroke="#050810" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "#ffffff", letterSpacing: "-0.02em" }}>TrendCast</span>
          </button>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "rgba(74,222,128,0.8)" }}>
            <span style={{ width: 5, height: 5, background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 4px #4ade80" }}/>
            Live
          </div>
        </div>

        <div className="mode-tabs">
          {["search", "category", "style"].map(m => (
            <button key={m} onClick={() => { setHeroMode(m); setShowWatchlist(false); }} className={`mode-tab ${heroMode === m && !showWatchlist ? "active" : "inactive"}`}>
              {m === "search" ? "Keyword Search" : m === "category" ? "Category Intelligence" : "✨ Personal Style"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <button onClick={() => setShowWatchlist(!showWatchlist)}
            style={{ padding: "5px 12px", background: showWatchlist ? "rgba(255,255,255,0.1)" : "transparent", color: showWatchlist ? "#ffffff" : "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
            ★ Watchlist
          </button>
          {user && (
            <div className="nav-user" style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 8, borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
              {user.avatar ? <img src={user.avatar} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} /> : <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#1a2540", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>👤</div>}
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{user.name?.split(" ")[0]}</span>
              <button onClick={onLogout} style={{ padding: "3px 10px", background: "transparent", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, fontSize: 11, fontFamily: "'Geist', sans-serif", cursor: "pointer" }}>Out</button>
            </div>
          )}
        </div>
      </nav>

      {/* WATCHLIST */}
      {showWatchlist && (
        <div style={{ maxWidth: 900, margin: "24px auto", ...SP }}>
          <Watchlist onPredict={handlePredict} />
        </div>
      )}

      {/* MAIN CONTENT */}
      {!showWatchlist && (
        <div style={{ maxWidth: 900, margin: "0 auto", ...SP, paddingTop: 40, paddingBottom: 40 }}>

          {heroMode === "search" && (
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.02em", color: "#ffffff", marginBottom: 8, lineHeight: 1.1 }}>
                  What will India wear<br /><span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.3)" }}>3 months from now?</span>
                </h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>Enter keywords to forecast upcoming trends across India's fashion market.</p>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>Category Explorer</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={category} onChange={e => setCategory(e.target.value)} onKeyDown={e => e.key === "Enter" && handleExpandCategory()}
                    placeholder="e.g. menswear, ethnic wear, streetwear..."
                    style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px", color: "#ffffff", fontSize: 13, outline: "none", fontFamily: "'Geist', sans-serif", transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.2)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
                  <button onClick={handleExpandCategory} disabled={categoryLoading || !category.trim()}
                    style={{ padding: "10px 16px", background: category.trim() ? "#ffffff" : "rgba(255,255,255,0.06)", color: category.trim() ? "#050810" : "rgba(255,255,255,0.3)", border: "none", borderRadius: 8, fontSize: 12, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: category.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap", transition: "all 0.2s", flexShrink: 0 }}>
                    {categoryLoading ? "..." : "Explore →"}
                  </button>
                </div>
                {categoryItems && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
                      Trending in <span style={{ color: "#ffffff" }}>{categoryItems.category}</span> — click to predict:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {categoryItems.items?.map((item, i) => (
                        <button key={i} onClick={() => handlePredict([item])}
                          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "6px 14px", color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#050810"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <KeywordInput onPredict={handlePredict} loading={loading} />
            </>
          )}

          {heroMode === "category" && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.02em", color: "#ffffff", marginBottom: 8 }}>Category Intelligence</h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Deep dive into colors, fabrics, fits and price segments trending right now.</p>
              </div>
              <CategoryIntelligence />
            </div>
          )}

          {heroMode === "style" && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.02em", color: "#ffffff", marginBottom: 8 }}>Personal Style AI</h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>Get outfit recommendations tailored to you, powered by upcoming trend forecasts.</p>
              </div>
              <PersonalizedStyling />
            </div>
          )}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div style={{ maxWidth: 900, margin: "0 auto", ...SP, paddingBottom: 60, textAlign: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 48 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#ffffff", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Scanning sources and analyzing trends...</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {["Google Trends", "Amazon India", "YouTube", "Reddit", "Social Media", "Claude AI"].map((s, i) => (
                <div key={s} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "4px 10px", animation: `fadeUp 0.4s ease ${i*0.1}s both` }}>{s}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{ maxWidth: 900, margin: "0 auto 40px", ...SP }}>
          <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 10, padding: "14px 18px", color: "#f87171", fontSize: 13 }}>{error}</div>
        </div>
      )}

      {/* RESULTS */}
      {results && (
        <div style={{ maxWidth: 1200, margin: "0 auto", ...SP, paddingBottom: 80 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "clamp(16px,3vw,32px)", marginBottom: 24, display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }} className="fade-up">
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>Market Intelligence</div>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(16px,2vw,20px)", color: "#ffffff", lineHeight: 1.5, marginBottom: 10 }}>{results.predictions?.overallInsight}</p>
              {results.predictions?.marketSummary && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{results.predictions.marketSummary}</p>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 20px", textAlign: "center", minWidth: 130 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 6, letterSpacing: "0.08em" }}>TOP TREND</div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "#ffffff" }}>{results.predictions?.topTrend}</div>
              </div>
              <button onClick={handleDownloadPDF} style={{ padding: "9px 18px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12, fontFamily: "'Geist', sans-serif", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#050810"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
                ↓ Download PDF
              </button>
            </div>
          </div>

          <div className="result-tabs" style={{ marginBottom: 24 }}>
            {["predictions", "charts", "history", "sources"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="result-tab"
                style={{ color: activeTab === tab ? "#ffffff" : "rgba(255,255,255,0.35)", borderBottomColor: activeTab === tab ? "#ffffff" : "transparent", fontWeight: activeTab === tab ? 500 : 400 }}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "predictions" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: 16 }}>
              {results.predictions?.predictions?.map((p, i) => (
                <div key={i} style={{ animation: `fadeUp 0.4s ease ${i*0.08}s both` }}>
                  <TrendCard prediction={p} rawScore={results.rawScores?.find(r => r.keyword === p.keyword)} />
                </div>
              ))}
            </div>
          )}
          {activeTab === "charts" && <OverallChart predictions={results.predictions?.predictions} rawScores={results.rawScores} />}
          {activeTab === "history" && <TrendHistory rawScores={results.rawScores} predictions={results.predictions?.predictions} />}
          {activeTab === "sources" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 12 }}>
              {results.rawScores?.map((raw, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 18, animation: `fadeUp 0.4s ease ${i*0.06}s both` }}>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "#ffffff", marginBottom: 14 }}>{raw.keyword}</div>
                  {Object.entries(raw.signals || {}).map(([source, data]) => {
                    const val = data.totalResults ?? data.thisWeekScore ?? data.tweetCount ?? data.totalProducts ?? data.searchVolume ?? 0;
                    const note = data.weeklyNote || '';
                    const hasData = val > 0 || (note && note !== 'no data');
                    return (
                      <div key={source} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: hasData ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.1)", textTransform: "capitalize" }}>{source.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span style={{ fontSize: 10, color: hasData ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)" }}>{note || (hasData ? val : "—")}</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 3, height: 2 }}>
                          <div style={{ width: Math.min(100, val) + "%", height: "100%", background: hasData ? "rgba(255,255,255,0.4)" : "transparent", borderRadius: 3 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APP FOOTER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", ...SP, paddingTop: 20, paddingBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 14, color: "rgba(255,255,255,0.3)" }}>TrendCast India</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>Powered by Claude AI · Data updates every 24 hours</span>
      </div>
    </>
  );
}