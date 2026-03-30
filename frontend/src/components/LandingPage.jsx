import { useEffect } from "react";

export default function LandingPage({ user, onLaunchApp }) {

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
    --gradient: linear-gradient(135deg,#7c3aed,#06b6d4);
    --border: rgba(255,255,255,0.08);
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
    background: rgba(10,10,10,0.7);
    border-bottom:1px solid var(--border);
  }

  /* HERO */
  .hero{
    min-height:100vh;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    text-align:center;
    padding-top:80px;
    animation:fadeUp 1s ease;
  }

  h1{
    font-size:clamp(40px,6vw,90px);
    line-height:1.1;
  }

  p{
    color:rgba(255,255,255,0.6);
    margin-top:20px;
    font-size:18px;
  }

  @keyframes fadeUp{
    from{opacity:0;transform:translateY(40px)}
    to{opacity:1;transform:translateY(0)}
  }

  /* BUTTON */
  .btn{
    margin-top:30px;
    padding:16px 36px;
    border:none;
    border-radius:14px;
    background:var(--gradient);
    color:white;
    font-weight:600;
    font-size:16px;
    cursor:pointer;
    transition:.3s;
  }

  .btn:hover{
    transform:scale(1.05);
    filter:brightness(1.2);
  }

  /* ABOUT */
  .about{
    padding:120px 20px;
    max-width:900px;
    margin:auto;
    text-align:center;
    animation:fadeUp 1s ease;
  }

  .about h2{
    font-size:42px;
    margin-bottom:20px;
  }

  .about p{
    line-height:1.9;
    margin-top:16px;
    font-size:16px;
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
        <button className="btn" onClick={onLaunchApp}>
          {user ? "Dashboard" : "Get Started"}
        </button>
      </div>

      {/* HERO */}
      <div className="hero">
        <h1>
          Predict Fashion <br /> Before It Trends
        </h1>

        <p>AI-powered fashion forecasting for India</p>

        <button className="btn" onClick={onLaunchApp}>
          Start Forecasting →
        </button>
      </div>

      {/* ABOUT */}
      <div className="about">
        <h2>About TrendCast</h2>

        <p>
          TrendCast is an AI-powered fashion intelligence platform designed for India's next generation of brands, designers, and entrepreneurs.
        </p>

        <p>
          We predict upcoming fashion trends using real-time data from Amazon, Google Trends, YouTube, and social media — helping you stay ahead of what people will wear next.
        </p>

        <p>
          Our system also delivers <b>personalized fashion recommendations</b> based on your weight, height, face shape, and style — so you don’t just follow trends, you wear what suits you best.
        </p>

        <p>
          With <b>Category Intelligence</b>, you can explore deep insights into colors, fabrics, fits, and pricing trends across India — enabling smarter design, buying, and marketing decisions.
        </p>

        <p>
          No more guessing. Just data-driven fashion decisions.
        </p>
      </div>
    </>
  );
}