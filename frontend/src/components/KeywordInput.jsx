import { useState } from "react";

const CHIP_STYLE = {
  padding: "8px 16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  color: "rgba(255,255,255,0.45)",
  fontSize: 12,
  fontFamily: "'Geist', sans-serif",
  cursor: "pointer",
  transition: "all 0.2s",
  WebkitAppearance: "none",
  touchAction: "manipulation",
  letterSpacing: "0.02em",
};

const INPUT_STYLE = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "13px 16px",
  color: "#ffffff",
  fontSize: 14,
  outline: "none",
  fontFamily: "'Geist', sans-serif",
  width: "100%",
  WebkitAppearance: "none",
  appearance: "none",
  transition: "all 0.2s",
  backdropFilter: "blur(8px)",
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
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      padding: 28,
    }}>
      {/* Background glow effect */}
      <div style={{
        position: "absolute", top: -60, right: -60,
        width: 200, height: 200,
        background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, left: -40,
        width: 160, height: 160,
        background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Headline */}
      <div style={{ marginBottom: 20, position: "relative" }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.2)", marginBottom: 6 }}>
          Trend Forecast
        </div>
        <div style={{ fontSize: "clamp(18px,3vw,24px)", fontFamily: "'Instrument Serif', serif", color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          What will India wear
          <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>next?</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>
          Enter up to 5 keywords — styles, fabrics or silhouettes
        </div>
      </div>

      {/* Glass keyword inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 16 }}>
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
                  ? "rgba(255,255,255,0.25)"
                  : kw.trim()
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(255,255,255,0.07)",
                background: kw.trim()
                  ? "rgba(255,255,255,0.06)"
                  : focused === i
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.03)",
                boxShadow: focused === i ? "0 0 0 3px rgba(255,255,255,0.04)" : "none",
              }}
            />
            {kw.trim() && (
              <button
                onClick={() => handleChange(i, "")}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 14, padding: 2, lineHeight: 1 }}>
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Quick-fill chips */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.15)", marginBottom: 8 }}>Quick add</div>
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
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}>
              + {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      {filled > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
            <div style={{ width: `${(filled / 5) * 100}%`, height: "100%", background: "rgba(255,255,255,0.3)", borderRadius: 1, transition: "width 0.3s ease" }} />
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>{filled}/5 added</span>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={handleSubmit}
        disabled={isDisabled}
        style={{
          width: "100%",
          padding: "15px",
          background: isDisabled
            ? "rgba(255,255,255,0.04)"
            : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
          color: isDisabled ? "rgba(255,255,255,0.2)" : "#080808",
          border: isDisabled ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.2)",
          borderRadius: 12,
          fontSize: 14,
          fontFamily: "'Geist', sans-serif",
          fontWeight: 700,
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          WebkitAppearance: "none",
          appearance: "none",
          touchAction: "manipulation",
          letterSpacing: "0.01em",
          boxShadow: isDisabled ? "none" : "0 4px 24px rgba(255,255,255,0.08), 0 1px 0 rgba(255,255,255,0.15) inset",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#080808", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
            Analyzing trends...
          </span>
        ) : (
          `Forecast ${filled > 0 ? filled : ""} Trend${filled !== 1 ? "s" : ""} →`
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}