import { useState, useEffect } from "react";

export default function LandingPage({ onLogin, user, onLaunchApp }) {
  const [showAuth, setShowAuth] = useState(false);

  // 🔥 CURSOR GLOW
  useEffect(() => {
    const glow = document.querySelector(".cursor-glow");
    window.addEventListener("mousemove", (e) => {
      if (glow) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      }
    });
  }, []);

  const G = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;600&display=swap');

  :root {
    --bg:#050505;
    --accent:#7c3aed;
    --accent2:#06b6d4;
    --border:rgba(255,255,255,0.1);
    --gradient: linear-gradient(135deg,#7c3aed,#06b6d4);
  }

  *{margin:0;padding:0;box-sizing:border-box}

  body{
    font-family:'Geist',sans-serif;
    background:#050505;
    color:white;
    overflow-x:hidden;
  }

  /* 🌌 BACKGROUND */
  body::before{
    content:"";
    position:fixed;
    inset:0;
    background:
      radial-gradient(circle at 20% 20%, rgba(124,58,237,0.25), transparent 40%),
      radial-gradient(circle at 80% 0%, rgba(6,182,212,0.2), transparent 40%);
    animation:bgMove 10s infinite alternate;
    z-index:-1;
  }

  @keyframes bgMove{
    0%{transform:translateY(0)}
    100%{transform:translateY(-40px)}
  }

  /* ✨ CURSOR */
  .cursor-glow{
    position:fixed;
    width:300px;height:300px;
    background:radial-gradient(circle,rgba(124,58,237,0.25),transparent 60%);
    pointer-events:none;
    transform:translate(-50%,-50%);
    z-index:999;
  }

  /* NAV */
  .nav{
    position:fixed;
    width:100%;
    top:0;
    padding:20px 40px;
    display:flex;
    justify-content:space-between;
    backdrop-filter:blur(16px);
    background:rgba(0,0,0,0.4);
  }

  /* HERO */
  .hero{
    height:100vh;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    text-align:center;
    animation:fadeUp 1s ease;
  }

  h1{
    font-size:clamp(40px,6vw,80px);
    line-height:1.1;
  }

  p{
    color:rgba(255,255,255,0.5);
    margin-top:20px;
  }

  @keyframes fadeUp{
    from{opacity:0;transform:translateY(40px)}
    to{opacity:1;transform:translateY(0)}
  }

  /* BUTTON */
  .btn{
    margin-top:30px;
    padding:14px 30px;
    border:none;
    border-radius:12px;
    background:var(--gradient);
    color:white;
    font-weight:600;
    cursor:pointer;
    transition:.3s;
  }

  .btn:hover{
    transform:scale(1.05);
    filter:brightness(1.2);
  }

  /* INPUT SECTION */
  .card{
    margin-top:60px;
    padding:25px;
    border-radius:16px;
    background:rgba(255,255,255,0.05);
    backdrop-filter:blur(12px);
    border:1px solid var(--border);
    width:90%;
    max-width:600px;
  }

  .grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
  }

  input{
    padding:14px;
    border-radius:10px;
    border:1px solid var(--border);
    background:rgba(255,255,255,0.03);
    color:white;
  }

  input:focus{
    outline:none;
    border-color:var(--accent);
    box-shadow:0 0 0 2px rgba(124,58,237,0.3);
  }

  @media(max-width:600px){
    .grid{grid-template-columns:1fr}
  }
  `;

  return (
    <>
      <style>{G}</style>

      {/* CURSOR */}
      <div className="cursor-glow"></div>

      {/* NAV */}
      <div className="nav">
        <div>TrendCast</div>
        <button
          className="btn"
          onClick={user ? onLaunchApp : () => setShowAuth(true)}
        >
          {user ? "Dashboard" : "Get Started"}
        </button>
      </div>

      {/* HERO */}
      <div className="hero">
        <h1>
          Predict Fashion <br /> Before It Trends
        </h1>
        <p>AI-powered trend forecasting for India</p>

        <button
          className="btn"
          onClick={user ? onLaunchApp : () => setShowAuth(true)}
        >
          Start Forecasting →
        </button>

        {/* 🔥 INPUT CARD */}
        <div className="card">
          <div className="grid">
            <input placeholder="cargo pants" />
            <input placeholder="linen shirt" />
            <input placeholder="co-ord set" />
            <input placeholder="baggy jeans" />
            <input placeholder="maxi dress" />
          </div>

          <button className="btn" style={{ width: "100%" }}>
            Forecast Trends →
          </button>
        </div>
      </div>
    </>
  );
}