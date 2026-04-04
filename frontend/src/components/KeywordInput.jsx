import { useState, useEffect } from "react";

const CHIP_STYLE = {
  padding: "8px 16px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 24,
  color: "rgba(255,255,255,0.8)",
  fontSize: 12,
  fontFamily: "'Geist', sans-serif",
  cursor: "pointer",
  transition: "all 0.2s ease",
  letterSpacing: "0.02em",
};

const INPUT_STYLE = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: "13px 16px",
  color: "#ffffff",
  fontSize: 14,
  outline: "none",
  fontFamily: "'Geist', sans-serif",
  width: "100%",
  transition: "all 0.25s ease",
  backdropFilter: "blur(10px)",
};

export default function KeywordInput({ onPredict, loading }) {
  const [keywords, setKeywords] = useState(["", "", "", "", ""]);
  const [focused, setFocused] = useState(null);

  

  const handleChange = (i, val) => {
    const updated = [...keywords];
    updated[i] = val;
    setKeywords(updated);
  };

  const handleSubmit = () => {
    const valid = keywords.filter(k => k.trim().length > 0);
    if (valid.length === 0) return;
    onPredict(valid);
  };

  const examples = ["cargo pants", "linen shirt", "co-ord set", "baggy jeans", "maxi dress"];
  const filled = keywords.filter(k => k.trim()).length;
  const isDisabled = loading || filled === 0;

  return (
    <div style={{
      position: "relative",
      borderRadius: 20,
      overflow: "hidden",
      background: "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      padding: 28,
    }}>

      {/* 🎨 NOISE TEXTURE */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
        opacity: 0.08,
        pointerEvents: "none",
      }} />

      {/* Background glow */}
      <div style={{
        position: "absolute", top: -60, right: -60,
        width: 200, height: 200,
        background: "radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)",
      }} />

      <div style={{
        position: "absolute", bottom: -40, left: -40,
        width: 160, height: 160,
        background: "radial-gradient(circle, rgba(236,72,153,0.2), transparent 70%)",
      }} />

      {/* Headline */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.5)"
        }}>
          Trend Forecast
        </div>

        <div style={{
          fontSize: "clamp(18px,3vw,24px)",
          fontFamily: "'Instrument Serif', serif",
          color: "#ffffff",
          marginTop: 6
        }}>
          What will India wear
          <span style={{ color: "#a5b4fc", marginLeft: 6 }}>next?</span>
        </div>

        <div style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.65)",
          marginTop: 6
        }}>
          Enter up to 5 keywords — styles, fabrics or silhouettes
        </div>
      </div>

      {/* Inputs */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 8,
        marginBottom: 16
      }}>
        {keywords.map((kw, i) => (
          <div key={i} style={{ position: "relative" }}>
            <input
              value={kw}
              onChange={e => handleChange(i, e.target.value)}
              onFocus={() => setFocused(i)}
              onBlur={() => setFocused(null)}
              placeholder={examples[i]}
              style={{
                ...INPUT_STYLE,
                border: focused === i
                  ? "1px solid transparent"
                  : "1px solid rgba(255,255,255,0.15)",
                backgroundClip: "padding-box",
                boxShadow: focused === i
                  ? "0 0 0 2px transparent, 0 0 0 2px rgba(99,102,241,0.6)"
                  : "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Chips */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 10,
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.3)",
          marginBottom: 8
        }}>
          QUICK ADD
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                const emptyIdx = keywords.findIndex(k => !k.trim());
                if (emptyIdx !== -1) handleChange(emptyIdx, ex);
                else handleChange(i, ex);
              }}
              style={CHIP_STYLE}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(99,102,241,0.2)";
                e.currentTarget.style.borderColor = "#6366f1";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
              }}
            >
              + {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      {filled > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            height: 3,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 2
          }}>
            <div style={{
              width: `${(filled / 5) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #6366f1, #ec4899)",
              borderRadius: 2,
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleSubmit}
        disabled={isDisabled}
        style={{
          width: "100%",
          padding: "15px",
          background: isDisabled
            ? "rgba(255,255,255,0.05)"
            : "linear-gradient(135deg, #6366f1, #ec4899)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontWeight: 600,
          cursor: isDisabled ? "not-allowed" : "pointer",
          boxShadow: isDisabled
            ? "none"
            : "0 10px 30px rgba(99,102,241,0.4)",
        }}
      >
        {loading ? "Analyzing..." : "Forecast Trends →"}
      </button>

    
    </div>
  );
}