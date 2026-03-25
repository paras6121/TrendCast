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

  return (
    <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 14 }}>
        Enter up to 5 keywords or trends to forecast
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8, marginBottom: 14 }}>
        {keywords.map((kw, i) => (
          <input
            key={i}
            value={kw}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder={examples[i]}
            style={{ background: "#0a0f1e", border: "1px solid #243050", borderRadius: 8, padding: "10px 12px", color: "#ffffff", fontSize: 13, outline: "none", fontFamily: "'Geist', sans-serif", width: "100%" }}
            onFocus={e => (e.target.style.borderColor = "#ffffff")}
            onBlur={e => (e.target.style.borderColor = "#243050")}
          />
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading || keywords.every(k => !k.trim())}
        style={{ width: "100%", padding: "13px", background: loading || keywords.every(k => !k.trim()) ? "#111d35" : "#ffffff", color: loading || keywords.every(k => !k.trim()) ? "#8aabdd" : "#0a0f1e", border: "none", borderRadius: 10, fontSize: 14, fontFamily: "'Geist', sans-serif", fontWeight: 500, cursor: loading || keywords.every(k => !k.trim()) ? "not-allowed" : "pointer" }}
      >
        {loading ? "Analyzing trends..." : "Forecast Trends →"}
      </button>
    </div>
  );
}