import { useState } from "react";

const CHIP_STYLE = {
  padding: "8px 16px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 24,
  color: "rgba(255,255,255,0.75)",
  fontSize: 12,
  fontFamily: "'Geist', sans-serif",
  cursor: "pointer",
  transition: "all 0.2s ease",
  WebkitAppearance: "none",
  touchAction: "manipulation",
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
  WebkitAppearance: "none",
  appearance: "none",
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
      background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 12px 50px rgba(0,0,0,0.45)",
      padding: 28,
    }}>
      
      {/* Background glow */}
      <div style={{
        position: "absolute", top: -60, right: -60,
        width: 200, height: 200,
        background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, left: -40,
        width: 160, height: 160,
        background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Headline */}
      <div style={{ marginBottom: 20, position: "relative" }}>
        <div style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.45)",
          marginBottom: 6
        }}>
          Trend Forecast
        </div>

        <div style={{
          fontSize: "clamp(18px,3vw,24px)",
          fontFamily: "'Instrument Serif', serif",
          color: "#ffffff",
          letterSpacing: "-0.02em",
          lineHeight: 1.2
        }}>
          What will India wear
          <span style={{
            fontStyle: "italic",
            color: "rgba(255,255,255,0.5)",
            marginLeft: 8
          }}>next?</span>
        </div>

        <div style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.6)",
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
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              onKeyUp={e => e.key === "Enter" && handleSubmit()}
              placeholder={examples[i]}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              onFocus={() => setFocused(i)}
              onBlur={() => setFocused(null)}
              style={{
                ...INPUT_STYLE,
                borderColor: focused === i
                  ? "rgba(255,255,255,0.45)"
                  : kw.trim()
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(255,255,255,0.12)",
                background: kw.trim()
                  ? "rgba(255,255,255,0.08)"
                  : focused === i
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(255,255,255,0.04)",
                boxShadow: focused === i
                  ? "0 0 0 2px rgba(255,255,255,0.12), 0 6px 24px rgba(0,0,0,0.35)"
                  : "none",
              }}
            />

            {kw.trim() && (
              <button
                onClick={() => handleChange(i, "")}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  fontSize: 14
                }}>
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Chips */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.25)",
          marginBottom: 8
        }}>
          Quick add
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
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            >
              + {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      {filled > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            flex: 1,
            height: 2,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 1
          }}>
            <div style={{
              width: `${(filled / 5) * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, #ffffff, rgba(255,255,255,0.6))",
              borderRadius: 1
            }} />
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            {filled}/5 added
          </span>
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
            : "linear-gradient(135deg, #ffffff 0%, #eaeaea 100%)",
          color: isDisabled ? "rgba(255,255,255,0.25)" : "#080808",
          border: isDisabled
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(255,255,255,0.2)",
          borderRadius: 12,
          fontSize: 14,
          fontFamily: "'Geist', sans-serif",
          fontWeight: 700,
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          boxShadow: isDisabled
            ? "none"
            : "0 10px 35px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
        onMouseEnter={e => {
          if (!isDisabled) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 14px 45px rgba(255,255,255,0.28)";
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {loading ? "Analyzing trends..." : `Forecast ${filled > 0 ? filled : ""} Trend${filled !== 1 ? "s" : ""} →`}
      </button>
    </div>
  );
}