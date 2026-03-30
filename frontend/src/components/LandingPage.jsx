import { useEffect, useState } from "react";

const API = "https://trendcast-backend.onrender.com";

/* 🔐 AUTH MODAL */
function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit() {
    const endpoint = mode === "signup" ? "/api/signup" : "/api/login";

    const res = await fetch(API + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "signup"
          ? { name, email, password }
          : { email, password }
      ),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.error);

    localStorage.setItem("tc_token", data.token);
    localStorage.setItem("tc_user", JSON.stringify(data.user));

    onLogin(data.user, data.token);
    onClose();
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#0a0a0a",
        padding: 30,
        borderRadius: 16,
        width: 320
      }}>
        <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>

        {mode === "signup" && (
          <input placeholder="Name" onChange={e => setName(e.target.value)} />
        )}

        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

        <button onClick={handleSubmit}>
          {mode === "login" ? "Login" : "Sign Up"}
        </button>

        <p onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          Switch to {mode === "login" ? "Signup" : "Login"}
        </p>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* 🔥 MAIN PAGE */
export default function LandingPage({ user, onLogin, onLaunchApp }) {
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const glow = document.querySelector(".cursor-glow");
    window.addEventListener("mousemove", (e) => {
      if (glow) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      }
    });
  }, []);

  function handleStart() {
    if (user) {
      onLaunchApp();
    } else {
      setShowAuth(true); // 🔥 FORCE LOGIN
    }
  }

  const G = `
  body { background:#050505; color:white; font-family:sans-serif; }

  .btn {
    padding:14px 30px;
    border-radius:12px;
    border:none;
    background:linear-gradient(135deg,#7c3aed,#06b6d4);
    color:white;
    cursor:pointer;
  }

  .nav {
    position:fixed;
    width:100%;
    display:flex;
    justify-content:space-between;
    padding:20px;
  }

  .hero {
    height:100vh;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    text-align:center;
  }
  `;

  return (
    <>
      <style>{G}</style>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={onLogin}
        />
      )}

      <div className="nav">
        <div>TrendCast</div>
        <button className="btn" onClick={handleStart}>
          {user ? "Dashboard" : "Get Started"}
        </button>
      </div>

      <div className="hero">
        <h1>Predict Fashion Before It Trends</h1>
        <p>AI-powered fashion forecasting for India</p>

        <button className="btn" onClick={handleStart}>
          Start Forecasting →
        </button>
      </div>

      <div style={{ padding: 80, textAlign: "center" }}>
        <h2>About TrendCast</h2>
        <p>Predict trends, personalize fashion, and explore category intelligence.</p>
      </div>
    </>
  );
}