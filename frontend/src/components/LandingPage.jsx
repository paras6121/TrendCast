import { useState, useEffect } from "react";

export default function LandingPage({ onLogin, user, onLaunchApp }) {
  const [showAuth, setShowAuth] = useState(false);

  // 🔥 KEYWORDS STATE
  const [keywords, setKeywords] = useState(["", "", "", "", ""]);

  function handleChange(i, value) {
    const updated = [...keywords];
    updated[i] = value;
    setKeywords(updated);
  }

  function handleForecast() {
    if (!keywords.some(k => k.trim())) {
      alert("Enter at least one keyword");
      return;
    }
    onLaunchApp();
  }

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

  /* BACKGROUND */
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

  .cursor-glow{
    position:fixed;
    width:300px;height:300px;
    background:radial-gradient(circle,rgba(124,58,237,0.25),transparent 60%);
    pointer-events:none;
    transform:translate(-50%,-50%);
    z-index:999;
  }

  .nav{
    position:fixed;
    width:100%;
    top:0;
    padding:20px 40px;
    display:flex;
    justify-content:space-between;
    background: rgba(10,10,10,0.7);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .hero{
    min-height:100vh;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    text-align:center;
    animation:fadeUp 1s ease;
    padding-top:80px;
  }

  h1{
    font-size:clamp(40px,6vw,80px);
  }

  p{
    color:rgba(255,255,255,0.6);
    margin-top:20px;
  }

  @keyframes fadeUp{
    from{opacity:0;transform:translateY(40px)}
    to{opacity:1;transform:translateY(0)}
  }

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
  }

  .card{
    margin-top:40px;
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

  .about{
    padding:100px 20px;
    max-width:900px;
    margin:auto;
    text-align:center;
    animation:fadeUp 1s ease;
  }

  .about p{
    line-height:1.9;
    margin-top:20px;
  }

  @media(max-width:600px){
    .grid{grid-template-columns:1fr}
  }
  `;

  return (
    <>
      <style>{G}</style>

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
        <h1>Predict Fashion Before It Trends</h1>
        <p>AI-powered fashion forecasting for India</p>

        <button
          className="btn"
          onClick={user ? onLaunchApp : () => setShowAuth(true)}
        >
          Start Forecasting →
        </button>

        {/* 🔥 WORKING INPUT */}
        <div className="card">
          <div className="grid">
            {keywords.map((k, i) => (
              <input
                key={i}
                value={k}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder="Enter keyword..."
              />
            ))}
          </div>

          <button
            className="btn"
            onClick={handleForecast}
            style={{ width: "100%" }}
          >
            Forecast Trends →
          </button>
        </div>
      </div>

      {/* ABOUT */}
      <div className="about">
        <h2 style={{ fontSize: "40px" }}>About TrendCast</h2>

        <p>
          TrendCast is an AI-powered fashion intelligence platform designed for India's next generation of brands, designers, and entrepreneurs.
        </p>

        <p>
          Our system predicts upcoming fashion trends by analyzing real-time data from platforms like Amazon, Google Trends, YouTube, and social media — helping you stay ahead of what people will wear next.
        </p>

        <p>
          We also provide <b>personalized fashion recommendations</b> based on your weight, height, face shape, and style — so you don’t just follow trends, you wear what actually suits you.
        </p>

        <p>
          With our <b>Category Intelligence</b>, you can explore deep insights into colors, fabrics, fits, and pricing trends across India — enabling smarter design, buying, and marketing decisions.
        </p>

        <p>
          No more guessing. Just data-driven fashion decisions.
        </p>
      </div>
    </>
  );
}