import { useEffect, useState } from "react";

const API = "https://trendcast-backend.onrender.com";

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
    <div onClick={e => e.target.classList.contains("modal-bg") && onClose()}
      className="modal-bg"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 420, animation: "fadeUp 0.4s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#ffffff"/>
            <path d="M8 20 L14 8 L20 20" stroke="#050505" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 16 L18 16" stroke="#050505" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>TrendCast</span>
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 6 }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
          {mode === "login" ? "Sign in to access your dashboard" : "Start forecasting India's next trends"}
        </p>

        {/* Google */}
        <button onClick={handleGoogleLogin}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 13, background: "#ffffff", border: "none", borderRadius: 10, color: "#0a0a0a", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5L31.8 34c-2.1 1.4-4.8 2-7.8 2-5.2 0-9.6-3-11.3-7.2l-6.5 5C9.9 39.7 16.5 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l5.7 5c3.5-3.2 5.8-8 5.8-14 0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.15)", fontSize: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          or
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, marginBottom: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "8px", border: "none", borderRadius: 7, background: mode === m ? "rgba(255,255,255,0.1)" : "transparent", color: mode === m ? "#ffffff" : "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "13px 16px", color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none" }} />
          )}
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "13px 16px", color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none" }} />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "13px 16px", color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: 14, outline: "none" }} />

          {error && <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #7c3aed, #06b6d4)", border: "none", borderRadius: 10, color: "#ffffff", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, marginTop: 4 }}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          {mode === "login" ? "No account? " : "Have an account? "}
          <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={{ color: "rgba(255,255,255,0.5)", cursor: "pointer", textDecoration: "underline" }}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function LandingPage({ user, onLaunchApp, onLogin }) {
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const glow = document.querySelector(".cursor-glow");
    const move = (e) => { if (glow) { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; } };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  function handleLogin(userData, userToken) { setShowAuth(false); onLogin(userData, userToken); }

  const G = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html, body { overflow-x: hidden; width: 100%; }
    body { font-family:'Inter',sans-serif; background:#050505; color:white; }

    body::before {
      content:"";
      position:fixed;
      inset:0;
      background:
        radial-gradient(circle at 20% 20%, rgba(124,58,237,0.2), transparent 40%),
        radial-gradient(circle at 80% 0%, rgba(6,182,212,0.15), transparent 40%);
      animation: bgMove 10s infinite alternate;
      z-index:-1;
    }
    @keyframes bgMove { 0%{transform:translateY(0)} 100%{transform:translateY(-40px)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }

    .cursor-glow {
      position:fixed; width:300px; height:300px;
      background:radial-gradient(circle,rgba(124,58,237,0.2),transparent 60%);
      pointer-events:none; transform:translate(-50%,-50%); z-index:998;
    }

    .lp-nav {
      position:fixed; width:100%; top:0; z-index:100;
      padding:18px clamp(20px,5vw,60px);
      display:flex; justify-content:space-between; align-items:center;
      background:rgba(5,5,5,0.8); backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(255,255,255,0.06);
    }

    .lp-hero {
      min-height:100vh; display:flex; flex-direction:column;
      justify-content:center; align-items:center; text-align:center;
      padding: 100px clamp(20px,5vw,60px) 60px;
    }

    .gradient-text {
      background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.5) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .btn-primary {
      padding:14px 32px; border:none; border-radius:12px;
      background:linear-gradient(135deg,#7c3aed,#06b6d4);
      color:white; font-weight:600; font-size:15px;
      cursor:pointer; transition:.2s; font-family:'Inter',sans-serif;
    }
    .btn-primary:hover { transform:translateY(-2px); filter:brightness(1.1); }

    .btn-outline {
      padding:14px 32px; border-radius:12px;
      border:1px solid rgba(255,255,255,0.12);
      background:transparent; color:rgba(255,255,255,0.6);
      font-size:15px; font-family:'Inter',sans-serif;
      cursor:pointer; transition:.2s; text-decoration:none; display:inline-block;
    }
    .btn-outline:hover { border-color:rgba(255,255,255,0.3); color:#ffffff; }

    .stats-bar {
      display:flex; gap:0; border:1px solid rgba(255,255,255,0.06);
      border-radius:16px; overflow:hidden; flex-wrap:wrap;
    }
    .stat-item {
      padding:24px 36px; background:rgba(255,255,255,0.02);
      border-right:1px solid rgba(255,255,255,0.06);
      text-align:center; flex:1; min-width:100px;
    }
    .stat-item:last-child { border-right:none; }

    .features-grid {
      display:grid; grid-template-columns:repeat(3,1fr);
      gap:1px; background:#1a1a1a; border:1px solid #1a1a1a;
      border-radius:20px; overflow:hidden;
    }
    .feature-card {
      background:#050505; padding:clamp(20px,3vw,36px);
      transition:background 0.3s;
    }
    .feature-card:hover { background:#0a0a0a; }

    .section { padding:clamp(60px,8vw,120px) clamp(20px,5vw,60px); max-width:1200px; margin:0 auto; }
    .section-label { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:5px 14px; font-size:12px; color:rgba(255,255,255,0.4); margin-bottom:20px; }
    .section-divider { border:none; border-top:1px solid rgba(255,255,255,0.05); margin:0; }

    .about-grid { display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:start; }
    .faq-item { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:20px 24px; margin-bottom:12px; }

    @media(max-width:768px) {
      .features-grid { grid-template-columns:1fr; }
      .about-grid { grid-template-columns:1fr; gap:40px; }
      .stat-item { padding:16px 20px; }
      .hide-mobile { display:none !important; }
    }
  `;

  return (
    <>
      <style>{G}</style>
      {showAuth && <AuthModal onLogin={handleLogin} onClose={() => setShowAuth(false)} />}
      <div className="cursor-glow" />

      {/* NAV */}
      <nav className="lp-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#ffffff"/>
            <path d="M8 20 L14 8 L20 20" stroke="#050505" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 16 L18 16" stroke="#050505" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>TrendCast</span>
          <span style={{ fontSize: 9, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", padding: "2px 7px", borderRadius: 4, letterSpacing: "0.1em" }}>INDIA</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="#features" className="hide-mobile" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "6px 12px" }}>Features</a>
          <a href="#about" className="hide-mobile" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "6px 12px" }}>About</a>
          {user ? (
            <button className="btn-primary" onClick={onLaunchApp}>Dashboard →</button>
          ) : (
            <>
              <button onClick={() => setShowAuth(true)} style={{ padding: "8px 18px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontFamily: "'Inter', sans-serif", fontSize: 13, cursor: "pointer" }}>Sign In</button>
              <button className="btn-primary" onClick={() => setShowAuth(true)}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 20, padding: "5px 14px", marginBottom: 28, fontSize: 12, color: "rgba(74,222,128,0.8)" }}>
          <span style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 6px #4ade80", animation: "pulse 2s infinite" }}/>
          Live data · Updated in real-time
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(40px,7vw,88px)", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 24, maxWidth: 800, animation: "fadeUp 0.8s ease both" }}>
          Predict Fashion<br />
          <span className="gradient-text">Before It Trends</span>
        </h1>

        <p style={{ fontSize: "clamp(15px,2vw,18px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 520, marginBottom: 40, fontWeight: 300, animation: "fadeUp 0.8s ease 0.15s both" }}>
          AI-powered trend forecasting for India's fashion market. Built on real signals from Amazon, Reddit, YouTube and Google Trends.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.8s ease 0.25s both" }}>
          <button className="btn-primary" onClick={user ? onLaunchApp : () => setShowAuth(true)}>
            {user ? "Open Dashboard →" : "Start Forecasting Free →"}
          </button>
          <a href="#features" className="btn-outline">See How It Works</a>
        </div>

        {/* Stats */}
        <div className="stats-bar" style={{ marginTop: 64, animation: "fadeUp 0.8s ease 0.35s both", maxWidth: 700, width: "100%" }}>
          {[{ num: "6", label: "Data Sources" }, { num: "85%", label: "Accuracy Target" }, { num: "3mo", label: "Forecast Window" }, { num: "Free", label: "To Start" }].map((s, i) => (
            <div key={i} className="stat-item">
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px,3vw,40px)", color: "#ffffff", lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6, letterSpacing: "0.04em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="section-divider" />

      {/* FEATURES */}
      <section id="features" className="section">
        <div style={{ marginBottom: 56 }}>
          <div className="section-label">Features</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-0.02em", marginBottom: 14 }}>
            Everything you need to<br />stay ahead of the curve
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", maxWidth: 480, lineHeight: 1.7 }}>
            From real-time scraping to AI predictions — TrendCast gives you the full picture before trends peak.
          </p>
        </div>
        <div className="features-grid">
          {[
            { icon: "📈", title: "Trend Forecasting", desc: "Predict which styles will peak in the next 3 months using signals from 6+ data sources." },
            { icon: "🧠", title: "Claude AI Analysis", desc: "Every prediction is powered by Claude AI — the most accurate interpretation of raw trend data." },
            { icon: "🛍️", title: "Category Intelligence", desc: "Deep dive into colors, fabrics, fits and price segments trending right now in India." },
            { icon: "✨", title: "Personal Style AI", desc: "Get personalized outfit recommendations based on your features and upcoming trends." },
            { icon: "👁️", title: "Watchlist", desc: "Track keywords and monitor when trends shift — weekly score updates for every keyword." },
            { icon: "📄", title: "PDF Reports", desc: "Download professional trend reports. Share with your team or use for buying decisions." },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="section-divider" />

      {/* HOW IT WORKS */}
      <section className="section">
        <div style={{ marginBottom: 56 }}>
          <div className="section-label">How It Works</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-0.02em" }}>
            From data to decision<br />in seconds
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 40 }}>
          {[
            { num: "01", title: "Enter Keywords", desc: "Type any fashion keyword — a style, fabric, silhouette or category you want to forecast." },
            { num: "02", title: "Data Collection", desc: "TrendCast scrapes Amazon, Reddit, YouTube, Google Trends and more in real-time." },
            { num: "03", title: "AI Analysis", desc: "Claude AI processes all signals and generates a detailed trend forecast with confidence scores." },
            { num: "04", title: "Act on Insights", desc: "Use predictions for buying, design or marketing. Download reports to share with your team." },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, color: "rgba(255,255,255,0.05)", lineHeight: 1, marginBottom: 20 }}>{s.num}</div>
              <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 16 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className="section-divider" />

      {/* ABOUT */}
      <section id="about" className="section">
        <div className="about-grid">
          <div>
            <div className="section-label">About</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,48px)", letterSpacing: "-0.02em", marginBottom: 24 }}>
              Built for India's<br />fashion industry
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: 16 }}>
              TrendCast was built by a developer and fashion forecaster who saw a gap — Indian fashion brands were making buying and design decisions based on gut feeling while the data to predict trends was hiding in plain sight.
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, marginBottom: 32 }}>
              By combining real-time web scraping with Claude AI's analytical power, TrendCast surfaces what India is actually buying, searching and talking about — before it becomes mainstream.
            </p>
            <div style={{ display: "flex", gap: 32 }}>
              {[{ num: "6+", label: "Data sources" }, { num: "3mo", label: "Forecast horizon" }, { num: "AI", label: "Claude powered" }].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: "#ffffff" }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {[
              { q: "Who is it for?", a: "Fashion brands, buyers, designers and entrepreneurs who need data-driven decisions about what to stock, design or market in India." },
              { q: "How accurate is it?", a: "Our target accuracy is 85%+ for 3-month trend forecasts. Predictions are based on multiple converging signals, not single data points." },
              { q: "Is my data private?", a: "Yes. Your searches, watchlists and style profiles are private to your account and never shared or sold." },
              { q: "Is it really free?", a: "Yes, TrendCast is free to get started. Sign up and start forecasting immediately — no credit card required." },
            ].map((item, i) => (
              <div key={i} className="faq-item">
                <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", marginBottom: 8 }}>{item.q}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* CTA */}
      <section style={{ padding: "clamp(60px,8vw,120px) clamp(20px,5vw,60px)", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px,5vw,64px)", letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.05 }}>
          Stop guessing.<br />
          <span className="gradient-text">Start forecasting.</span>
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, marginBottom: 40 }}>Free to get started. No credit card required.</p>
        <button className="btn-primary" onClick={user ? onLaunchApp : () => setShowAuth(true)} style={{ fontSize: 16, padding: "16px 44px" }}>
          {user ? "Open Dashboard →" : "Get Started Free →"}
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "28px clamp(20px,5vw,60px)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#ffffff"/>
            <path d="M8 20 L14 8 L20 20" stroke="#050505" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 16 L18 16" stroke="#050505" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "rgba(255,255,255,0.5)" }}>TrendCast India</span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Powered by Claude AI · © 2026 TrendCast</div>
        <div style={{ display: "flex", gap: 20 }}>
          {[["Features", "#features"], ["About", "#about"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}>
              {l}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}