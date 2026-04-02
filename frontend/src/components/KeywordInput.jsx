import { useState } from "react";

export default function KeywordInput({ onPredict, loading }) {
  const [keywords, setKeywords] = useState(["", "", "", "", ""]);

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
  const isDisabled = loading || keywords.every(k => !k.trim());

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
        Enter up to 5 keywords to forecast
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8, marginBottom: 14 }}>
        {keywords.map((kw, i) => (
          <input
            key={i}
            value={kw}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            onKeyUp={e => e.key === "Enter" && handleSubmit()}
            placeholder={examples[i]}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "11px 12px",
              color: "#ffffff",
              fontSize: 14,
              outline: "none",
              fontFamily: "'Geist', sans-serif",
              width: "100%",
              WebkitAppearance: "none",
              appearance: "none",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
        ))}
      </div>

      {/* Example chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {examples.map((ex, i) => (
          <button key={i} onClick={() => handleChange(i, ex)}
            style={{ padding: "4px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'Geist', sans-serif", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
            {ex}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isDisabled}
        style={{
          width: "100%",
          padding: "14px",
          background: isDisabled ? "rgba(255,255,255,0.04)" : "#ffffff",
          color: isDisabled ? "rgba(255,255,255,0.2)" : "#0a0a0a",
          border: "none",
          borderRadius: 10,
          fontSize: 14,
          fontFamily: "'Geist', sans-serif",
          fontWeight: 600,
          cursor: isDisabled ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          WebkitAppearance: "none",
          appearance: "none",
          touchAction: "manipulation",
        }}
      >
        {loading ? "Analyzing trends..." : "Forecast Trends →"}
      </button>
    </div>
  );
}