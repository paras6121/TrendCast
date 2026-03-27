import { useState, useEffect, useRef } from "react";
import KeywordInput from "./components/KeywordInput";
import TrendCard from "./components/TrendCard";
import OverallChart from "./components/OverallChart";
import Watchlist from "./components/Watchlist";
import TrendHistory from "./components/TrendHistory";
import CategoryIntelligence from "./components/CategoryIntelligence";

const API = "https://trendcast-backend.onrender.com";
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0f1e; color: #ffffff; font-family: 'Geist', sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0f1e; }
  ::-webkit-scrollbar-thumb { background: #243050; border-radius: 2px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
  @keyframes modalIn { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  .fade-up { animation: fadeUp 0.5s ease both; }

  /* Lock overlay on blurred features */
  .feature-locked { position: relative; pointer-events: none; user-select: none; }
  .feature-locked::after {
    content: '';
    position: absolute; inset: 0;
    background: rgba(10,15,30,0.55);
    backdrop-filter: blur(3px);
    border-radius: inherit;
    z-index: 10;
  }

  /* Modal */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(5,8,18,0.82);
    backdrop-filter: blur(8px);
    z-index: 200;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .modal-card {
    background: #0d1428;
    border: 1px solid #1a2540;
    border-radius: 24px;
    padding: 40px 36px;
    width: 100%; max-width: 400px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
    animation: modalIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }
  .auth-input {
    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid #1a2540;
    border-radius: 10px; padding: 13px 16px; color: #ffffff;
    font-family: 'Geist', sans-serif; font-size: 15px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .auth-input:focus { border-color: #4a6aaa; box-shadow: 0 0 0 3px rgba(74,106,170,0.15); }
  .auth-input::placeholder { color: #2a3550; }
  .google-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 13px; background: #ffffff; border: none; border-radius: 10px;
    color: #1a1a1a; font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: opacity 0.2s, transform 0.15s;
  }
  .google-btn:hover { opacity: 0.92; transform: translateY(-1px); }
  .primary-btn {
    width: 100%; padding: 13px; background: #4a6aaa; border: none; border-radius: 10px;
    color: #ffffff; font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: background 0.2s, transform 0.15s;
  }
  .primary-btn:hover { background: #5a7aba; transform: translateY(-1px); }
  .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* Lock badge on features */
  .lock-prompt {
    position: absolute; inset: 0; z-index: 11;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    cursor: pointer;
  }
  .lock-badge {
    background: #0d1428; border: 1px solid #1a2540; border-radius: 12px;
    padding: 12px 20px; display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #8aabdd; font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    transition: border-color 0.2s, color 0.2s;
  }
  .lock-badge:hover { border-color: #4a6aaa; color: #ffffff; }

  .divider { display: flex; align-items: center; gap: 12px; color: #2a3550; font-size: 12px; margin: 4px 0; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #1a2540; }
`;

// ── AUTH MODAL ────────────────────────────────────────────────────────────────
function AuthModal({ onLogin, onClose }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleGoogleLogin() {
    window.location.href = `${API}/auth/google`;
  }

  async function handleSubmit() {
    setError("");
    if (!email || !password) return setError("Please fill in all fields.");
    if (mode === "signup" && !name) return setError("Please enter your name.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const endpoint = mode === "signup" ? "/api/signup" : "/api/login";
      const body = mode === "signup" ? { name, email, password } : { email, password };
      const res = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Something went wrong.");
      localStorage.setItem("tc_token", data.token);
      localStorage.setItem("tc_user", JSON.stringify(data.user));
      onLogin(data.user, data.token);
    } catch {
      setError("Network error. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal-card">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#ffffff"/>
            <path d="M8 20 L14 8 L20 20" stroke="#0a0f1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 16 L18 16" stroke="#0a0f1e" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20 }}>TrendCast</span>
        </div>

        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, marginBottom: 4 }}>
          {mode === "login" ? "Sign in to continue" : "Create your account"}
        </h2>
        <p style={{ fontSize: 13, color: "#4a6aaa", marginBottom: 24 }}>
          Unlock predictions, reports & watchlist
        </p>

        {/* Google button */}
        <button className="google-btn" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5L31.8 34c-2.1 1.4-4.8 2-7.8 2-5.2 0-9.6-3-11.3-7.2l-6.5 5C9.9 39.7 16.5 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l5.7 5c3.5-3.2 5.8-8 5.8-14 0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider" style={{ margin: "16px 0" }}>or</div>

        {/* Tab toggle */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, marginBottom: 20 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "8px", border: "none", borderRadius: 7, background: mode === m ? "#1a2e50" : "transparent", color: mode === m ? "#ffffff" : "#4a6aaa", fontFamily: "'Geist', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <input className="auth-input" type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
          )}
          <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <input className="auth-input" type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />

          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>{error}</div>
          )}

          <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#2a3550" }}>
          {mode === "login" ? "No account? " : "Have an account? "}
          <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={{ color: "#4a6aaa", cursor: "pointer", textDecoration: "underline" }}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ── LOCKED FEATURE WRAPPER ────────────────────────────────────────────────────
function LockedFeature({ children, isLoggedIn, onUnlock, label = "Sign in to use this feature" }) {
  if (isLoggedIn) return children;
  return (
    <div style={{ position: "relative" }}>
      <div className="feature-locked">{children}</div>
      <div className="lock-prompt" onClick={onUnlock}>
        <div className="lock-badge">
          <span>🔒</span> {label}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryItems, setCategoryItems] = useState(null);
  const [activeTab, setActiveTab] = useState("predictions");
  const [heroMode, setHeroMode] = useState("search");
  const [showWatchlist, setShowWatchlist] = useState(false);

  // Restore session + handle Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get("token");
    const googleName = params.get("name");
    const googleEmail = params.get("email");
    const googleAvatar = params.get("avatar");

    if (googleToken) {
      const userData = { name: googleName, email: googleEmail, avatar: googleAvatar };
      localStorage.setItem("tc_token", googleToken);
      localStorage.setItem("tc_user", JSON.stringify(userData));
      setToken(googleToken);
      setUser(userData);
      window.history.replaceState({}, '', '/');
      setAuthChecked(true);
      return;
    }

    const savedToken = localStorage.getItem("tc_token");
    const savedUser = localStorage.getItem("tc_user");
    if (savedToken && savedUser) { setToken(savedToken); setUser(JSON.parse(savedUser)); }
    setAuthChecked(true);
  }, []);

  function handleLogin(userData, userToken) {
    setUser(userData);
    setToken(userToken);
    setShowAuthModal(false);
  }

  function handleLogout() {
    localStorage.removeItem("tc_token");
    localStorage.removeItem("tc_user");
    setUser(null); setToken(null); setResults(null);
  }

  function openAuth() { setShowAuthModal(true); }

  function authFetch(url, options = {}) {
    return fetch(`${API}${url}`, {
      ...options,
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, ...(options.headers || {}) },
    });
  }

  async function handlePredict(keywords) {
    if (!user) { openAuth(); return; }
    setLoading(true); setError(null); setResults(null); setActiveTab("predictions"); setHeroMode("search");
    try {
      const res = await authFetch("/api/predict", { method: "POST", body: JSON.stringify({ keywords }) });
      if (res.status === 401 || res.status === 403) { handleLogout(); openAuth(); return; }
      if (!res.ok) throw new Error("Server error: " + res.status);
      setResults(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleExpandCategory() {
    if (!user) { openAuth(); return; }
    if (!category.trim()) return;
    setCategoryLoading(true); setCategoryItems(null);
    try {
      const res = await authFetch("/api/expand-category", { method: "POST", body: JSON.stringify({ category }) });
      if (res.status === 401 || res.status === 403) { handleLogout(); openAuth(); return; }
      if (!res.ok) throw new Error("Server error: " + res.status);
      setCategoryItems(await res.json());
    } catch (err) { setError(err.message); }
    finally { setCategoryLoading(false); }
  }

  async function handleDownloadPDF() {
    if (!results || !user) return;
    try {
      const res = await authFetch("/api/download-report", { method: "POST", body: JSON.stringify({ predictions: results.predictions, rawScores: results.rawScores, keywords: results.keywords }) });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "trendcast-report.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error("PDF error:", err); }
  }

  if (!authChecked) return null;

  return (
    <>
      <style>{G}</style>

      {/* AUTH MODAL */}
      {showAuthModal && <AuthModal onLogin={handleLogin} onClose={() => setShowAuthModal(false)} />}

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,15,30,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1a2540", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#ffffff"/>
            <path d="M8 20 L14 8 L20 20" stroke="#0a0f1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 16 L18 16" stroke="#0a0f1e" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#ffffff" }}>TrendCast</span>
          <span style={{ fontSize: 10, background: "#ffffff", color: "#0a0f1e", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.08em", marginLeft: 4, fontWeight: 600 }}>INDIA</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["Google", "Amazon", "Reddit", "YouTube"].map(s => (
            <span key={s} style={{ fontSize: 11, color: "#8aabdd", background: "#111d35", padding: "3px 8px", borderRadius: 4 }}>{s}</span>
          ))}
          <span style={{ fontSize: 11, color: "#c8a96e", background: "#1e1a10", border: "1px solid #3a3010", padding: "3px 8px", borderRadius: 4 }}>Claude AI</span>

          {user ? (
            <>
              <button onClick={() => setShowWatchlist(!showWatchlist)}
                style={{ marginLeft: 8, padding: "6px 14px", background: showWatchlist ? "#ffffff" : "#111d35", color: showWatchlist ? "#0a0f1e" : "#8aabdd", border: "1px solid #1a2540", borderRadius: 6, fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer" }}>
                ★ Watchlist
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8, paddingLeft: 12, borderLeft: "1px solid #1a2540" }}>
                {user.avatar
                  ? <img src={user.avatar} style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }} />
                  : <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#1a2e50", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>👤</div>
                }
                <span style={{ fontSize: 12, color: "#8aabdd" }}>{user.name?.split(" ")[0]}</span>
                <button onClick={handleLogout} style={{ padding: "4px 10px", background: "transparent", color: "#3a4560", border: "1px solid #1a2540", borderRadius: 6, fontSize: 11, fontFamily: "'Geist', sans-serif", cursor: "pointer" }}>Sign out</button>
              </div>
            </>
          ) : (
            <button onClick={openAuth} style={{ marginLeft: 8, padding: "7px 18px", background: "#ffffff", color: "#0a0f1e", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: "pointer" }}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* WATCHLIST */}
      {showWatchlist && user && (
        <div style={{ maxWidth: 900, margin: "20px auto", padding: "0 40px" }}>
          <Watchlist onPredict={handlePredict} />
        </div>
      )}

      {/* HERO */}
      <div style={{ padding: "80px 40px 60px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#111d35", border: "1px solid #243050", borderRadius: 20, padding: "5px 14px", marginBottom: 28, fontSize: 12, color: "#8aabdd" }}>
          <span style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 6px #4ade80" }}/>
          Live data · Updated in real-time
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.08, letterSpacing: "-0.03em", color: "#ffffff", marginBottom: 20 }}>
          What will India wear<br /><span style={{ fontStyle: "italic", color: "#4a6aaa" }}>3 months from now?</span>
        </h1>
        <p style={{ fontSize: 16, color: "#8aabdd", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 40px", fontWeight: 300 }}>
          AI-powered trend forecasting built on real purchase signals from Amazon, Reddit, YouTube and Google Trends.
        </p>

        {/* STATS */}
        <div style={{ display: "flex", gap: 1, justifyContent: "center", marginBottom: 40 }}>
          {[{ label: "Data Sources", value: "6" }, { label: "Accuracy Target", value: "85%" }, { label: "Forecast Window", value: "3 mo" }, { label: "Market", value: "India" }].map((s, i) => (
            <div key={i} style={{ background: "#0d1428", border: "1px solid #1a2540", padding: "12px 24px", borderRadius: i === 0 ? "8px 0 0 8px" : i === 3 ? "0 8px 8px 0" : "0", textAlign: "center", minWidth: 100 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: "#ffffff" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#8aabdd", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* NOT LOGGED IN — CTA banner */}
        {!user && (
          <div style={{ background: "linear-gradient(135deg, #0d1a35, #111d3a)", border: "1px solid #1e3060", borderRadius: 16, padding: "20px 28px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", textAlign: "left" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#ffffff", marginBottom: 4 }}>🔒 Features locked — sign in to unlock</div>
              <div style={{ fontSize: 13, color: "#4a6aaa" }}>Search trends, explore categories, download reports & manage watchlists</div>
            </div>
            <button onClick={openAuth} style={{ padding: "10px 24px", background: "#ffffff", color: "#0a0f1e", border: "none", borderRadius: 10, fontSize: 14, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              Get Started Free →
            </button>
          </div>
        )}

        {/* MODE TOGGLE */}
        <div style={{ display: "flex", gap: 4, background: "#0d1428", border: "1px solid #1a2540", borderRadius: 12, padding: 4, width: "fit-content", margin: "0 auto 24px" }}>
          {["search", "category"].map(m => (
            <button key={m} onClick={() => setHeroMode(m)}
              style={{ padding: "8px 24px", background: heroMode === m ? "#ffffff" : "none", color: heroMode === m ? "#0a0f1e" : "#8aabdd", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
              {m === "search" ? "Keyword Search" : "Category Intelligence"}
            </button>
          ))}
        </div>

        {heroMode === "search" && (
          <>
            {/* Category Explorer — locked if not logged in */}
            <LockedFeature isLoggedIn={!!user} onUnlock={openAuth} label="Sign in to explore categories">
              <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24, marginBottom: 16, textAlign: "left" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 12 }}>Category Explorer</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input value={category} onChange={e => setCategory(e.target.value)} onKeyDown={e => e.key === "Enter" && handleExpandCategory()}
                    placeholder="e.g. menswear, ethnic wear, streetwear..."
                    style={{ flex: 1, background: "#0a0f1e", border: "1px solid #243050", borderRadius: 8, padding: "10px 14px", color: "#ffffff", fontSize: 14, outline: "none", fontFamily: "'Geist', sans-serif" }}
                    onFocus={e => (e.target.style.borderColor = "#ffffff")} onBlur={e => (e.target.style.borderColor = "#243050")} />
                  <button onClick={handleExpandCategory} disabled={categoryLoading || !category.trim()}
                    style={{ padding: "10px 20px", background: categoryLoading ? "#111d35" : "#ffffff", color: categoryLoading ? "#8aabdd" : "#0a0f1e", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {categoryLoading ? "Thinking..." : "Explore →"}
                  </button>
                </div>
                {categoryItems && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: "#8aabdd", marginBottom: 10 }}>Trending in <span style={{ color: "#ffffff", fontWeight: 500 }}>{categoryItems.category}</span> — click to predict:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {categoryItems.items?.map((item, i) => (
                        <button key={i} onClick={() => handlePredict([item])}
                          style={{ background: "#111d35", border: "1px solid #243050", borderRadius: 20, padding: "7px 16px", color: "#ffffff", fontSize: 13, fontFamily: "'Geist', sans-serif", cursor: "pointer" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#0a0f1e"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#111d35"; e.currentTarget.style.color = "#ffffff"; }}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </LockedFeature>

            {/* Keyword Input — locked if not logged in */}
            <LockedFeature isLoggedIn={!!user} onUnlock={openAuth} label="Sign in to search trends">
              <KeywordInput onPredict={handlePredict} loading={loading} />
            </LockedFeature>
          </>
        )}

        {heroMode === "category" && (
  <LockedFeature isLoggedIn={!!user} onUnlock={openAuth} label="Sign in to use Category Intelligence">
    <CategoryIntelligence />
  </LockedFeature>
)}
        )
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px 60px", textAlign: "center" }}>
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 40 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffffff", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
            </div>
            <div style={{ fontSize: 14, color: "#8aabdd", marginBottom: 16 }}>Scanning sources and analyzing trends...</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {["Google Trends", "Amazon India", "YouTube", "Reddit", "Social Media", "Claude AI"].map((s, i) => (
                <div key={s} style={{ fontSize: 11, color: "#8aabdd", background: "#111d35", border: "1px solid #1a2540", borderRadius: 4, padding: "4px 10px", animation: `fadeUp 0.4s ease ${i*0.15}s both` }}>{s}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <div style={{ maxWidth: 900, margin: "0 auto 40px", padding: "0 40px" }}><div style={{ background: "#1a0a0a", border: "1px solid #3a1515", borderRadius: 10, padding: "14px 18px", color: "#f87171", fontSize: 14 }}>{error}</div></div>}

      {results && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 80px" }}>
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 20, padding: 32, marginBottom: 32, display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }} className="fade-up">
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 10 }}>Market Intelligence</div>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#ffffff", lineHeight: 1.5, marginBottom: 10 }}>{results.predictions?.overallInsight}</p>
              {results.predictions?.marketSummary && <p style={{ fontSize: 13, color: "#8aabdd", lineHeight: 1.6 }}>{results.predictions.marketSummary}</p>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
              <div style={{ background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 12, padding: "16px 24px", textAlign: "center", minWidth: 160 }}>
                <div style={{ fontSize: 11, color: "#8aabdd", marginBottom: 6 }}>TOP TREND</div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#ffffff" }}>{results.predictions?.topTrend}</div>
              </div>
              <button onClick={handleDownloadPDF} style={{ padding: "10px 20px", background: "#ffffff", color: "#0a0f1e", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: "pointer" }}>↓ Download PDF Report</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid #1a2540" }}>
            {["predictions", "charts", "history", "sources"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: "10px 20px", background: "none", color: activeTab === tab ? "#ffffff" : "#8aabdd", border: "none", borderBottom: activeTab === tab ? "2px solid #ffffff" : "2px solid transparent", fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: activeTab === tab ? 500 : 400, cursor: "pointer", textTransform: "capitalize", marginBottom: -1 }}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "predictions" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
              {results.predictions?.predictions?.map((p, i) => (
                <div key={i} style={{ animation: `fadeUp 0.4s ease ${i*0.1}s both` }}>
                  <TrendCard prediction={p} rawScore={results.rawScores?.find(r => r.keyword === p.keyword)} />
                </div>
              ))}
            </div>
          )}
          {activeTab === "charts" && <OverallChart predictions={results.predictions?.predictions} rawScores={results.rawScores} />}
          {activeTab === "history" && <TrendHistory rawScores={results.rawScores} predictions={results.predictions?.predictions} />}
          {activeTab === "sources" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {results.rawScores?.map((raw, i) => (
                <div key={i} style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 14, padding: 22, animation: `fadeUp 0.4s ease ${i*0.08}s both` }}>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#ffffff", marginBottom: 18 }}>{raw.keyword}</div>
                  {Object.entries(raw.signals || {}).map(([source, data]) => {
                    const val = data.totalResults ?? data.thisWeekScore ?? data.tweetCount ?? data.totalProducts ?? data.searchVolume ?? 0;
                    const note = data.weeklyNote || '';
                    const hasData = val > 0 || (note && note !== 'no data');
                    return (
                      <div key={source} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 12, color: hasData ? "#ffffff" : "#1a2540", textTransform: "capitalize" }}>{source.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span style={{ fontSize: 11, color: hasData ? "#8aabdd" : "#1a2540" }}>{note || (hasData ? val : "blocked")}</span>
                        </div>
                        <div style={{ background: "#1a2540", borderRadius: 3, height: 3 }}>
                          <div style={{ width: Math.min(100, val) + "%", height: "100%", background: hasData ? "#ffffff" : "#1a2540", borderRadius: 3 }} />
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

      <div style={{ borderTop: "1px solid #1a2540", padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: "#ffffff" }}>TrendCast India</div>
        <div style={{ fontSize: 12, color: "#8aabdd" }}>Powered by Claude AI · Data updates every 24 hours</div>
      </div>
    </>
  );
}
