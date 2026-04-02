import { useState, useRef } from "react";

const API = "https://trendcast-backend.onrender.com";

const SKIN_TONES = [
  { name: "Fair", hex: "#FDDBB4" },
  { name: "Light", hex: "#F5C5A3" },
  { name: "Medium", hex: "#E8A87C" },
  { name: "Wheatish", hex: "#C68642" },
  { name: "Dusky", hex: "#A0522D" },
  { name: "Deep", hex: "#6B3A2A" },
];

const BODY_TYPES = ["Slim", "Athletic", "Average", "Curvy", "Plus Size", "Petite"];
const FACE_SHAPES = ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong"];
const EVENTS = ["Casual Daily", "Office/Work", "Wedding/Festive", "Date Night", "Party", "Outdoor/Travel", "Formal Event"];
const GENDERS = [
  { value: "Male", emoji: "👨" },
  { value: "Female", emoji: "👩" },
  { value: "Non-binary/Other", emoji: "🧑" },
];

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  padding: "11px 12px",
  color: "#ffffff",
  fontSize: 13,
  outline: "none",
  fontFamily: "'Geist', sans-serif",
  WebkitAppearance: "none",
};

const cardStyle = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 20,
};

const labelStyle = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.25)",
  marginBottom: 12,
};

export default function PersonalizedStyling() {
  const [gender, setGender] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [faceShape, setFaceShape] = useState("");
  const [event, setEvent] = useState("");
  const [accessories, setAccessories] = useState("");
  const [budget, setBudget] = useState("");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("colors");
  const fileRef = useRef();

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!gender) return setError("Please select your gender.");
    if (!skinTone && !imageBase64) return setError("Please select your skin tone or upload a photo.");
    setLoading(true); setError(null); setResult(null);
    try {
      const token = localStorage.getItem("tc_token");
      const res = await fetch(`${API}/api/personalized-styling`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ gender, skinTone, height, weight, bodyType, faceShape, event, accessories, imageBase64, budget }),
      });
      if (!res.ok) throw new Error("Server error: " + res.status);
      const data = await res.json();
      setResult(data.advice);
      setActiveTab("colors");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: "colors", label: "🎨 Colors" },
    { id: "outfits", label: "👗 Outfits" },
    { id: "trends", label: "📈 Trends" },
    { id: "body", label: "✂️ Body Tips" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>

      {!result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Gender */}
          <div style={cardStyle}>
            <div style={labelStyle}>Gender *</div>
            <div style={{ display: "flex", gap: 10 }}>
              {GENDERS.map(g => (
                <button key={g.value} onClick={() => setGender(g.value)}
                  style={{ flex: 1, padding: "12px 8px", background: gender === g.value ? "#ffffff" : "rgba(255,255,255,0.04)", color: gender === g.value ? "#0a0a0a" : "rgba(255,255,255,0.5)", border: `1px solid ${gender === g.value ? "#ffffff" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", touchAction: "manipulation" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{g.emoji}</div>
                  {g.value}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div style={cardStyle}>
            <div style={labelStyle}>Skin Tone</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SKIN_TONES.map(tone => (
                <div key={tone.name} onClick={() => setSkinTone(tone.name)}
                  style={{ cursor: "pointer", textAlign: "center", padding: "10px 12px", borderRadius: 10, border: `1px solid ${skinTone === tone.name ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.08)"}`, background: skinTone === tone.name ? "rgba(255,255,255,0.06)" : "transparent", transition: "all 0.2s" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: tone.hex, margin: "0 auto 6px", border: "2px solid rgba(255,255,255,0.1)" }} />
                  <div style={{ fontSize: 11, color: skinTone === tone.name ? "#ffffff" : "rgba(255,255,255,0.35)" }}>{tone.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div style={cardStyle}>
            <div style={labelStyle}>Upload Photo (Optional)</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>AI will analyze your features directly from the photo</div>
            <div onClick={() => fileRef.current.click()}
              style={{ border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}>
              {image
                ? <img src={image} style={{ maxHeight: 120, borderRadius: 8 }} alt="upload" />
                : <><div style={{ fontSize: 24, marginBottom: 4 }}>📸</div><div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Click to upload</div></>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          </div>

          {/* Body Details */}
          <div style={cardStyle}>
            <div style={labelStyle}>Body Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", display: "block", marginBottom: 6 }}>Height</label>
                <input value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 5ft 7in or 170cm" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", display: "block", marginBottom: 6 }}>Weight (kg)</label>
                <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 65kg" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Body Type</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BODY_TYPES.map(b => (
                <button key={b} onClick={() => setBodyType(b)}
                  style={{ padding: "6px 14px", background: bodyType === b ? "#ffffff" : "transparent", color: bodyType === b ? "#0a0a0a" : "rgba(255,255,255,0.4)", border: `1px solid ${bodyType === b ? "#ffffff" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer", transition: "all 0.2s", touchAction: "manipulation" }}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Face Shape */}
          <div style={cardStyle}>
            <div style={labelStyle}>Face Shape</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FACE_SHAPES.map(f => (
                <button key={f} onClick={() => setFaceShape(f)}
                  style={{ padding: "6px 14px", background: faceShape === f ? "#ffffff" : "transparent", color: faceShape === f ? "#0a0a0a" : "rgba(255,255,255,0.4)", border: `1px solid ${faceShape === f ? "#ffffff" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer", transition: "all 0.2s", touchAction: "manipulation" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion + Accessories */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={cardStyle}>
              <div style={labelStyle}>Occasion</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {EVENTS.map(e => (
                  <button key={e} onClick={() => setEvent(e)}
                    style={{ padding: "6px 12px", background: event === e ? "#ffffff" : "transparent", color: event === e ? "#0a0a0a" : "rgba(255,255,255,0.4)", border: `1px solid ${event === e ? "#ffffff" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, fontSize: 11, fontFamily: "'Geist', sans-serif", cursor: "pointer", transition: "all 0.2s", touchAction: "manipulation" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={labelStyle}>Accessories You Own</div>
              <textarea value={accessories} onChange={e => setAccessories(e.target.value)}
                placeholder="e.g. gold jewellery, silver watch..."
                style={{ ...inputStyle, height: 100, resize: "none" }}
                onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
            </div>
          </div>

          {/* Budget */}
          <div style={cardStyle}>
            <div style={labelStyle}>Budget (Optional)</div>
            <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. ₹500-2000, under ₹5000..." style={inputStyle}
              onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
          </div>

          {error && <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>{error}</div>}

          <button onClick={handleAnalyze} disabled={loading}
            style={{ padding: "16px", background: loading ? "rgba(255,255,255,0.06)" : "#ffffff", color: loading ? "rgba(255,255,255,0.3)" : "#0a0a0a", border: "none", borderRadius: 12, fontSize: 15, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", WebkitAppearance: "none", touchAction: "manipulation" }}>
            {loading ? "✨ Analyzing your style + upcoming trends..." : "✨ Get My Personalized Style Advice →"}
          </button>
        </div>
      )}

      {result && (
        <div>
          {/* Summary */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>Your Style Profile</div>
              <p style={{ fontSize: 16, color: "#ffffff", lineHeight: 1.6, marginBottom: 8 }}>{result.summary}</p>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>⭐ {result.topOutfit}</div>
            </div>
            <button onClick={() => setResult(null)}
              style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, touchAction: "manipulation" }}>
              ← Redo
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 4, marginBottom: 16 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ flex: 1, padding: "10px 8px", background: activeTab === t.id ? "#ffffff" : "transparent", color: activeTab === t.id ? "#0a0a0a" : "rgba(255,255,255,0.4)", border: "none", borderRadius: 8, fontSize: 12, fontFamily: "'Geist', sans-serif", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", touchAction: "manipulation" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* COLORS TAB */}
          {activeTab === "colors" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={cardStyle}>
                <div style={{ ...labelStyle, color: "#4ade80" }}>✅ Colors That Suit You</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.colorPalette?.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: c.hex, border: "1px solid rgba(255,255,255,0.1)", boxShadow: `0 4px 12px ${c.hex}33` }} />
                        {c.trending && <div style={{ position: "absolute", top: -4, right: -4, background: "#4ade80", borderRadius: "50%", width: 14, height: 14, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#000" }}>↑</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: "#ffffff", fontWeight: 500 }}>{c.name} {c.trending && <span style={{ fontSize: 10, color: "#4ade80", marginLeft: 4 }}>TRENDING</span>}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{c.reason}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)" }}>Best: {c.season}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={cardStyle}>
                <div style={{ ...labelStyle, color: "#f87171" }}>❌ Colors To Avoid</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.avoidColors?.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: c.hex, border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, opacity: 0.5, filter: "grayscale(40%)" }} />
                      <div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500, textDecoration: "line-through" }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{c.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* OUTFITS TAB */}
          {activeTab === "outfits" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px,100%), 1fr))", gap: 16 }}>
              {result.outfits?.map((o, i) => {
                const prompt = encodeURIComponent(`${o.name} Indian fashion outfit, ${gender} model, ${o.colors?.join(", ")} colors, clean white background, professional fashion photography, full body shot`);
                const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=400&height=500&nologo=true`;
                return (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${o.trending ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ width: "100%", height: 220, background: "rgba(255,255,255,0.03)", position: "relative", overflow: "hidden" }}>
                      <img src={imageUrl} alt={o.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                      <div style={{ display: "none", position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                        <div style={{ fontSize: 32 }}>👔</div>
                        <div>{o.name}</div>
                      </div>
                      {o.trending && <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(74,222,128,0.9)", color: "#000", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700 }}>TRENDING</div>}
                    </div>
                    <div style={{ padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 600 }}>{o.name}</div>
                        <div style={{ fontSize: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap", marginLeft: 8, flexShrink: 0 }}>{o.occasion}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5, marginBottom: 10 }}>{o.description}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                        {o.colors?.map((c, j) => <span key={j} style={{ fontSize: 10, background: "rgba(255,255,255,0.06)", borderRadius: 4, padding: "2px 8px", color: "rgba(255,255,255,0.4)" }}>{c}</span>)}
                      </div>
                      {o.tip && <div style={{ fontSize: 11, color: "#4ade80", borderLeft: "2px solid #4ade80", paddingLeft: 8, marginBottom: 10 }}>💡 {o.tip}</div>}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {[
                          { name: "Myntra", url: `https://www.myntra.com/${encodeURIComponent(o.name)}`, color: "#ff3f6c" },
                          { name: "Amazon", url: `https://www.amazon.in/s?k=${encodeURIComponent(o.name + " " + (budget || ""))}`, color: "#ff9900" },
                          { name: "Ajio", url: `https://www.ajio.com/search/?text=${encodeURIComponent(o.name)}`, color: "#e91e63" },
                        ].map((shop, j) => (
                          <a key={j} href={shop.url} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, padding: "5px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = shop.color; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = shop.color; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
                            🛍 {shop.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TRENDS TAB */}
          {activeTab === "trends" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                📈 These trends are predicted for the next 1-3 months, personalized for your profile
              </div>
              {result.futureTrends?.map((t, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 18, display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "start" }}>
                  <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 10, padding: "8px 12px", textAlign: "center", minWidth: 60 }}>
                    <div style={{ fontSize: 10, color: "#4ade80", fontWeight: 600, marginBottom: 2 }}>TREND</div>
                    <div style={{ fontSize: 11, color: "#ffffff" }}>{t.when}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 600, marginBottom: 4 }}>{t.trend}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>{t.relevance}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", borderLeft: "2px solid rgba(255,255,255,0.15)", paddingLeft: 8 }}>How to wear: {t.howToWear}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BODY TIPS TAB */}
          {activeTab === "body" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={cardStyle}>
                  <div style={labelStyle}>✂️ Cuts & Silhouettes</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{result.bodyTips}</div>
                </div>
                <div style={cardStyle}>
                  <div style={labelStyle}>😊 Face & Accessories</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>{result.faceTips}</div>
                </div>
              </div>
              <div style={cardStyle}>
                <div style={{ ...labelStyle, color: "#f87171" }}>🚫 Styles To Avoid</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {result.avoidStyles?.map((s, i) => (
                    <div key={i} style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.12)", borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 13, color: "#f87171", fontWeight: 500, marginBottom: 4 }}>✗ {s.style}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{s.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}