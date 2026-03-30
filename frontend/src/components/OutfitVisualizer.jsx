import { useState } from "react";

const API = "https://trendcast-backend.onrender.com";

export default function OutfitVisualizer({ outfits, token, skinTone, bodyType }) {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  async function generateImage(outfit, index) {
    setLoading(prev => ({ ...prev, [index]: true }));
    setErrors(prev => ({ ...prev, [index]: null }));
    try {
      const res = await fetch(`${API}/api/generate-outfit-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          outfitName: outfit.name,
          colors: outfit.colors,
          description: outfit.description,
          occasion: outfit.occasion,
          skinTone,
          bodyType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setImages(prev => ({ ...prev, [index]: data.imageUrl }));
    } catch (err) {
      setErrors(prev => ({ ...prev, [index]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [index]: false }));
    }
  }

  if (!outfits || outfits.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>
        Outfit Visualization — AI Generated
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {outfits.map((outfit, i) => (
          <div key={i} style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 14, overflow: "hidden" }}>

            {/* Image area */}
            <div style={{ width: "100%", height: 260, background: "#080e1c", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              {images[i] ? (
                <img src={images[i]} alt={outfit.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : loading[i] ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12 }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffffff", animation: `pulse 1.2s ease-in-out ${j*0.2}s infinite` }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: "#4a5a7a" }}>Generating outfit...</div>
                  <div style={{ fontSize: 11, color: "#2a3a5a", marginTop: 4 }}>Takes 10-15 seconds</div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>👗</div>
                  <div style={{ fontSize: 13, color: "#4a5a7a", marginBottom: 16 }}>See this outfit visualized</div>
                  <button onClick={() => generateImage(outfit, i)}
                    style={{ padding: "10px 20px", background: "#ffffff", color: "#0a0f1e", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: "pointer" }}>
                    ✨ Generate Image
                  </button>
                  <div style={{ fontSize: 10, color: "#1a2540", marginTop: 8 }}>Powered by DALL-E 3</div>
                </div>
              )}
            </div>

            {/* Outfit info */}
            <div style={{ padding: 16 }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 16, color: "#ffffff", marginBottom: 6 }}>{outfit.name}</div>
              <div style={{ fontSize: 12, color: "#4a5a7a", marginBottom: 10, lineHeight: 1.5 }}>{outfit.description}</div>

              {/* Color swatches */}
              {outfit.colors?.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  {outfit.colors.map((color, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 4, background: "#111d35", borderRadius: 12, padding: "3px 8px" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, border: "1px solid #1a2540" }} />
                      <span style={{ fontSize: 11, color: "#8aabdd" }}>{color}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, background: "#111d35", color: "#8aabdd", padding: "3px 8px", borderRadius: 4 }}>{outfit.occasion}</span>
                {outfit.buyAt && (
                  <span style={{ fontSize: 11, color: "#4a5a7a" }}>Buy at: {outfit.buyAt}</span>
                )}
              </div>

              {outfit.tip && (
                <div style={{ marginTop: 10, fontSize: 12, color: "#4a6aaa", background: "#0a1428", borderRadius: 8, padding: "8px 10px" }}>
                  💡 {outfit.tip}
                </div>
              )}

              {errors[i] && (
                <div style={{ marginTop: 10, fontSize: 12, color: "#f87171", background: "#1a0a0a", borderRadius: 8, padding: "8px 10px" }}>
                  {errors[i]}
                </div>
              )}

              {images[i] && (
                <button onClick={() => generateImage(outfit, i)}
                  style={{ marginTop: 10, width: "100%", padding: "8px", background: "none", border: "1px solid #1a2540", borderRadius: 6, color: "#4a5a7a", fontSize: 11, fontFamily: "'Geist', sans-serif", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#ffffff"; e.currentTarget.style.color = "#ffffff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.color = "#4a5a7a"; }}>
                  ↻ Regenerate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}