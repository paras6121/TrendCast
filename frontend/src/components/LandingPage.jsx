import { useState } from "react";

const API = "https://trendcast-backend.onrender.com";

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; width: 100%; }
  body { background: #080808; color: #ffffff; font-family: 'Geist', sans-serif; }
  ::selection { background: rgba(255,255,255,0.12); }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: #080808; }
  ::-webkit-scrollbar-thumb { background: #222222; border-radius: 2px; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
  @keyframes modalIn { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.92); backdrop-filter: blur(16px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal-card { background: #0f0f0f; border: 1px solid #1e1e1e; border-radius: 24px; padding: 44px 40px; width: 100%; max-width: 420px; box-shadow: 0 60px 120px rgba(0,0,0,0.8); animation: modalIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .auth-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid #1e1e1e; border-radius: 10px; padding: 14px 16px; color: #ffffff; font-family: 'Geist', sans-serif; font-size: 15px; outline: none; transition: border-color 0.2s; }
  .auth-input:focus { border-color: rgba(255,255,255,0.25); }
  .auth-input::placeholder { color: #333333; }
  .google-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; background: #ffffff; border: none; border-radius: 10px; color: #0a0a0a; font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.15s; }
  .google-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .primary-btn { width: 100%; padding: 14px; background: #ffffff; border: none; border-radius: 10px; color: #080808; font-family: 'Geist', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.15s; }
  .primary-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .primary-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
  .divider { display: flex; align-items: center; gap: 12px; color: #222222; font-size: 12px; }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #1e1e1e; }
  .lp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 clamp(20px,5vw,80px); height: 64px; display: flex; align-items: center; justify-content: space-between; background: rgba(8,8,8,0.8); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.04); }
  .lp-hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px clamp(20px,5vw,80px) 80px; text-align: center; position: relative; overflow: hidden; }
  .lp-section { padding: clamp(60px,8vw,120px) clamp(20px,5vw,80px); max-width: 1200px; margin: 0 auto; }
  .lp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #141414; border: 1px solid #141414; border-radius: 20px; overflow: hidden; }
  .lp-card { background: #080808; padding: clamp(24px,3vw,40px); transition: background 0.3s; }
  .lp-card:hover { background: #0d0d0d; }
  .lp-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; }
  .stat-num { font-family: 'Instrument Serif', serif; font-size: clamp(36px,5vw,64px); color: #ffffff; line-height: 1; }
  .tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 5px 14px; font-size: 12px; color: rgba(255,255,255,0.4); }
  @media (max-width: 768px) {
    .lp-grid-3 { grid-template-columns: 1fr; }
    .lp-steps { grid-template-columns: 1fr; gap: 20px; }
    .modal-card { padding: 28px 20px; }
    .hide-mobile { display: none; }
    .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
  }
`;

function AuthModal({ onLogin, onClose }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleGoogleLogin() { window.location.href = `${API}/auth/google`; }

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
    } catch { setError("Network error. Is the server running?"); }
    finally { setLoading(false); }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target.classList.contains("modal-backdrop") && onClose()}>
      <div className="modal-card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#ffffff"/>
            <path d="M8 20 L14 8 L20 20" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 16 L18 16" stroke="#080808" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, letterSpacing: "-0.02em" }}>TrendCast</span>
        </div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, letterSpacing: "-0.02em", marginBottom: 6 }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 28 }}>
          {mode === "login" ? "Sign in to access your dashboard" : "Start forecasting India's next trends"}
        </p>
        <button className="google-btn" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5L31.8 34c-2.1 1.4-4.8 2-7.8 2-5.2 0-9.6-3-11.3-7.2l-6.5 5C9.9 39.7 16.5 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l5.7 5c3.5-3.2 5.8-8 5.8-14 0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>
        <div className="divider" style={{ margin: "20px 0" }}>or</div>
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 4, marginBottom: 20, border: "1px solid #1e1e1e" }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "9px", border: "none", borderRadius: 7, background: mode === m ? "rgba(255,255,255,0.07)" : "transparent", color: mode === m ? "#ffffff" : "rgba(255,255,255,0.3)", fontFamily: "'Geist', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && <input className="auth-input" type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />}
          <input className="auth-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          <input className="auth-input" type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          {error && (
            <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>{error}</div>
          )}
          <button className="primary-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.18)" }}>
          {mode === "login" ? "No account? " : "Have an account? "}
          <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={{ color: "rgba(255,255,255,0.45)", cursor: "pointer", textDecoration: "underline" }}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function LandingPage({ onLogin, user, onLaunchApp }) {
  const [showAuth, setShowAuth] = useState(false);
  function handleLogin(u, t) { setShowAuth(false); onLogin(u, t); }

  const border = "1px solid rgba(255,255,255,0.06)";
  const muted = "rgba(255,255,255,0.35)";
  const dimmed = "rgba(255,255,255,0.18)";

  return (
    <>
      <style>{G}</style>
      {showAuth && <AuthModal onLogin={handleLogin} onClose={() => setShowAuth(false)} />}

      {/* NAV */}
      <nav className="lp-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#ffffff"/>
            <path d="M8 20 L14 8 L20 20" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 16 L18 16" stroke="#080808" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, letterSpacing: "-0.02em" }}>TrendCast</span>
          <span style={{ fontSize: 9, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", padding: "2px 7px", borderRadius: 4, letterSpacing: "0.1em", fontWeight: 500 }}>INDIA</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="#about" style={{ fontSize: 13, color: dimmed, textDecoration: "none", padding: "6px 12px" }} className="hide-mobile">About</a>
          <a href="#features" style={{ fontSize: 13, color: dimmed, textDecoration: "none", padding: "6px 12px" }} className="hide-mobile">Features</a>
          {user ? (
            <button onClick={onLaunchApp} style={{ padding: "8px 20px", background: "#ffffff", color: "#080808", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: "pointer" }}>
              Open Dashboard →
            </button>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{ padding: "8px 20px", background: "#ffffff", color: "#080808", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: "pointer" }}>
              Get Started
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 820, animation: "fadeUp 0.8s ease both" }}>
          <div className="tag" style={{ marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, background: "#d4d4d4", borderRadius: "50%", animation: "pulse 2s infinite" }}/>
            Live data · Updated in real-time
          </div>

          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(42px, 7vw, 92px)", lineHeight: 1.02, letterSpacing: "-0.03em", color: "#ffffff", marginBottom: 24 }}>
            What will India<br />
            wear <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.28)" }}>tomorrow?</span>
          </h1>

          <p style={{ fontSize: "clamp(15px, 2vw, 19px)", color: muted, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 44px", fontWeight: 300 }}>
            AI-powered trend forecasting for India's fashion market. Built on real signals from Amazon, Reddit, YouTube and Google Trends.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={user ? onLaunchApp : () => setShowAuth(true)}
              style={{ padding: "14px 32px", background: "#ffffff", color: "#080808", border: "none", borderRadius: 12, fontSize: 15, fontFamily: "'Geist', sans-serif", fontWeight: 700, cursor: "pointer", transition: "transform 0.15s, opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              {user ? "Open Dashboard →" : "Start Forecasting Free →"}
            </button>
            <a href="#features"
              style={{ padding: "14px 32px", background: "transparent", color: muted, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 15, fontFamily: "'Geist', sans-serif", fontWeight: 500, cursor: "pointer", textDecoration: "none", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = muted; }}>
              See How It Works
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 0, marginTop: 80, border, borderRadius: 16, overflow: "hidden", animation: "fadeUp 0.8s ease 0.2s both", flexWrap: "wrap" }}>
          {[
            { num: "6", label: "Data Sources" },
            { num: "85%", label: "Accuracy Target" },
            { num: "3mo", label: "Forecast Window" },
            { num: "∞", label: "Trend Queries" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "28px 40px", background: "rgba(255,255,255,0.015)", borderRight: i < 3 ? border : "none", textAlign: "center", flex: 1, minWidth: 120 }}>
              <div className="stat-num">{s.num}</div>
              <div style={{ fontSize: 12, color: dimmed, marginTop: 6, letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="lp-section">
        <div style={{ marginBottom: 64 }}>
          <div className="tag" style={{ marginBottom: 16 }}>Features</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-0.02em", color: "#ffffff", marginBottom: 14 }}>
            Everything you need to<br />stay ahead of the curve
          </h2>
          <p style={{ fontSize: 15, color: muted, maxWidth: 480, lineHeight: 1.7 }}>
            From real-time scraping to AI predictions — TrendCast gives you the full picture before trends peak.
          </p>
        </div>

        <div className="lp-grid-3">
          {[
            { icon: "📈", title: "Trend Forecasting", desc: "Predict which styles will peak in the next 3 months using signals from 6+ data sources across India's fashion market." },
            { icon: "🧠", title: "Claude AI Analysis", desc: "Every prediction is powered by Anthropic's Claude AI — the most accurate interpretation of raw trend data available." },
            { icon: "🛍️", title: "Category Intelligence", desc: "Deep dive into any fashion category — colors, fabrics, fits and price segments trending right now in India." },
            { icon: "✨", title: "Personal Style AI", desc: "Get personalized outfit recommendations based on your skin tone, body type, face shape and upcoming trends." },
            { icon: "👁️", title: "Watchlist", desc: "Track keywords and get notified when trends shift. Monitor your most important categories weekly." },
            { icon: "📄", title: "PDF Reports", desc: "Download professional trend reports for any prediction. Share with your team or use for buying decisions." },
          ].map((f, i) => (
            <div key={i} className="lp-card" style={{ animation: `fadeUp 0.5s ease ${i * 0.08}s both` }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#ffffff", marginBottom: 8, letterSpacing: "-0.01em" }}>{f.title}</div>
              <div style={{ fontSize: 13, color: muted, lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "clamp(60px,8vw,120px) clamp(20px,5vw,80px)", borderTop: border, borderBottom: border }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: 64 }}>
            <div className="tag" style={{ marginBottom: 16 }}>How It Works</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-0.02em", color: "#ffffff" }}>
              From data to decision<br />in seconds
            </h2>
          </div>
          <div className="lp-steps">
            {[
              { num: "01", title: "Enter Keywords", desc: "Type any fashion keyword — a style, fabric, silhouette or category you want to forecast." },
              { num: "02", title: "Data Collection", desc: "TrendCast scrapes Amazon, Reddit, YouTube, Google Trends and more in real-time." },
              { num: "03", title: "AI Analysis", desc: "Claude AI processes all signals and generates a detailed trend forecast with confidence scores." },
              { num: "04", title: "Act on Insights", desc: "Use predictions for buying, design or marketing decisions. Download reports to share with your team." },
            ].map((s, i) => (
              <div key={i} style={{ animation: `fadeUp 0.5s ease ${i * 0.1}s both` }}>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 48, color: "rgba(255,255,255,0.05)", lineHeight: 1, marginBottom: 20 }}>{s.num}</div>
                <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 20 }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: "#ffffff", marginBottom: 10, letterSpacing: "-0.01em" }}>{s.title}</div>
                <div style={{ fontSize: 13, color: muted, lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DATA SOURCES */}
      <section className="lp-section">
        <div style={{ marginBottom: 48 }}>
          <div className="tag" style={{ marginBottom: 16 }}>Data Sources</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-0.02em", color: "#ffffff", marginBottom: 14 }}>
            Built on real signals
          </h2>
          <p style={{ fontSize: 15, color: muted, maxWidth: 480, lineHeight: 1.7 }}>
            Not guesses. Not surveys. Real purchase intent and social signals from where India actually shops and talks.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { name: "Amazon India", desc: "Purchase signals & new arrivals" },
            { name: "Google Trends", desc: "Search volume & velocity" },
            { name: "Reddit", desc: "Community discussions" },
            { name: "YouTube", desc: "Content trends & views" },
            { name: "Google Shopping", desc: "Product demand signals" },
            { name: "Social Media", desc: "Viral & emerging signals" },
            { name: "Claude AI", desc: "Intelligence layer" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.025)", border, borderRadius: 12, padding: "14px 20px", animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#ffffff", marginBottom: 3 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: dimmed }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding: "clamp(60px,8vw,120px) clamp(20px,5vw,80px)", borderTop: border }}>
        <div className="about-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div className="tag" style={{ marginBottom: 20 }}>About</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-0.02em", color: "#ffffff", marginBottom: 24 }}>
              Built for India's<br />fashion industry
            </h2>
            <p style={{ fontSize: 15, color: muted, lineHeight: 1.8, marginBottom: 20 }}>
              TrendCast was built by a developer and fashion forecaster who saw a gap — Indian fashion brands were making buying and design decisions based on gut feeling while the data to predict trends was hiding in plain sight across the internet.
            </p>
            <p style={{ fontSize: 15, color: muted, lineHeight: 1.8, marginBottom: 32 }}>
              By combining real-time web scraping with Claude AI's analytical power, TrendCast surfaces what India is actually buying, searching and talking about — before it becomes mainstream.
            </p>
            <div style={{ display: "flex", gap: 32 }}>
              {[{ num: "6+", label: "Data sources" }, { num: "3mo", label: "Forecast horizon" }, { num: "AI", label: "Powered by Claude" }].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: "#ffffff" }}>{s.num}</div>
                  <div style={{ fontSize: 12, color: dimmed, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { q: "Who is it for?", a: "Fashion brands, buyers, designers and entrepreneurs who need to make data-driven decisions about what to stock, design or market in India." },
              { q: "How accurate is it?", a: "Our target accuracy is 85%+ for 3-month trend forecasts. Predictions are based on multiple converging signals, not single data points." },
              { q: "Is my data private?", a: "Yes. Your searches, watchlists and style profiles are private to your account and never shared or sold." },
            ].map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.02)", border, borderRadius: 14, padding: "20px 24px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", marginBottom: 8 }}>{item.q}</div>
                <div style={{ fontSize: 13, color: muted, lineHeight: 1.7 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "clamp(60px,8vw,120px) clamp(20px,5vw,80px)", borderTop: border }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(32px,5vw,64px)", letterSpacing: "-0.03em", color: "#ffffff", marginBottom: 20, lineHeight: 1.05 }}>
            Stop guessing.<br />
            <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.28)" }}>Start forecasting.</span>
          </h2>
          <p style={{ fontSize: 15, color: muted, lineHeight: 1.7, marginBottom: 40 }}>
            Free to get started. No credit card required.
          </p>
          <button
            onClick={user ? onLaunchApp : () => setShowAuth(true)}
            style={{ padding: "16px 40px", background: "#ffffff", color: "#080808", border: "none", borderRadius: 12, fontSize: 16, fontFamily: "'Geist', sans-serif", fontWeight: 700, cursor: "pointer", transition: "transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            {user ? "Open Dashboard →" : "Get Started Free →"}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "32px clamp(20px,5vw,80px)", borderTop: border, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#ffffff"/>
            <path d="M8 20 L14 8 L20 20" stroke="#080808" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 16 L18 16" stroke="#080808" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: "rgba(255,255,255,0.5)" }}>TrendCast India</span>
        </div>
        <div style={{ fontSize: 12, color: dimmed }}>Powered by Claude AI · © 2026 TrendCast</div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Features", "About", "Privacy"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              style={{ fontSize: 12, color: dimmed, textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
              onMouseLeave={e => e.currentTarget.style.color = dimmed}>
              {l}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}