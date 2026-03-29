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

export default function PersonalizedStyling() {
  const [gender, setGender] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [faceShape, setFaceShape] = useState("");
  const [event, setEvent] = useState("");
  const [accessories, setAccessories] = useState("");
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
        body: JSON.stringify({ gender, skinTone, height, weight, bodyType, faceShape, event, accessories, imageBase64 }),
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
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 0 60px" }}>

      {/* Input Form */}
      {!result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Gender */}
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 12 }}>Gender *</div>
            <div style={{ display: "flex", gap: 10 }}>
              {GENDERS.map(g => (
                <button key={g.value} onClick={() => setGender(g.value)}
                  style={{ flex: 1, padding: "12px 8px", background: gender === g.value ? "#ffffff" : "#111d35", color: gender === g.value ? "#0a0f1e" : "#8aabdd", border: `2px solid ${gender === g.value ? "#ffffff" : "#1a2540"}`, borderRadius: 10, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{g.emoji}</div>
                  {g.value}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 12 }}>Skin Tone</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SKIN_TONES.map(tone => (
                <div key={tone.name} onClick={() => setSkinTone(tone.name)}
                  style={{ cursor: "pointer", textAlign: "center", padding: "10px 12px", borderRadius: 10, border: `2px solid ${skinTone === tone.name ? "#ffffff" : "#1a2540"}`, background: skinTone === tone.name ? "rgba(255,255,255,0.05)" : "transparent", transition: "all 0.2s" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: tone.hex, margin: "0 auto 6px", border: "2px solid rgba(255,255,255,0.1)" }} />
                  <div style={{ fontSize: 11, color: skinTone === tone.name ? "#ffffff" : "#8aabdd" }}>{tone.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 4 }}>Upload Photo (Optional)</div>
            <div style={{ fontSize: 12, color: "#2a3a5a", marginBottom: 12 }}>AI will analyze your features directly from the photo</div>
            <div onClick={() => fileRef.current.click()}
              style={{ border: "2px dashed #1a2540", borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#ffffff"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1a2540"}>
              {image
                ? <img src={image} style={{ maxHeight: 120, borderRadius: 8 }} />
                : <><div style={{ fontSize: 24, marginBottom: 4 }}>📸</div><div style={{ fontSize: 13, color: "#4a5a7a" }}>Click to upload</div></>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
          </div>

          {/* Body Details */}
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 12 }}>Body Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "#4a5a7a", display: "block", marginBottom: 6 }}>Height</label>
                <input value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 5ft 7in or 170cm"
                  style={{ width: "100%", background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 8, padding: "10px 12px", color: "#ffffff", fontSize: 13, outline: "none", fontFamily: "'Geist', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "#ffffff"} onBlur={e => e.target.style.borderColor = "#1a2540"} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#4a5a7a", display: "block", marginBottom: 6 }}>Weight (kg)</label>
                <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 65kg"
                  style={{ width: "100%", background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 8, padding: "10px 12px", color: "#ffffff", fontSize: 13, outline: "none", fontFamily: "'Geist', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "#ffffff"} onBlur={e => e.target.style.borderColor = "#1a2540"} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#4a5a7a", marginBottom: 8 }}>Body Type</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BODY_TYPES.map(b => (
                <button key={b} onClick={() => setBodyType(b)}
                  style={{ padding: "6px 14px", background: bodyType === b ? "#ffffff" : "#111d35", color: bodyType === b ? "#0a0f1e" : "#8aabdd", border: "1px solid #1a2540", borderRadius: 20, fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Face Shape */}
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 12 }}>Face Shape</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FACE_SHAPES.map(f => (
                <button key={f} onClick={() => setFaceShape(f)}
                  style={{ padding: "6px 14px", background: faceShape === f ? "#ffffff" : "#111d35", color: faceShape === f ? "#0a0f1e" : "#8aabdd", border: "1px solid #1a2540", borderRadius: 20, fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion + Accessories */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 12 }}>Occasion</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {EVENTS.map(e => (
                  <button key={e} onClick={() => setEvent(e)}
                    style={{ padding: "6px 12px", background: event === e ? "#ffffff" : "#111d35", color: event === e ? "#0a0f1e" : "#8aabdd", border: "1px solid #1a2540", borderRadius: 20, fontSize: 11, fontFamily: "'Geist', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 12 }}>Accessories You Own</div>
              <textarea value={accessories} onChange={e => setAccessories(e.target.value)}
                placeholder="e.g. gold jewellery, silver watch, leather belt, sunglasses..."
                style={{ width: "100%", height: 100, background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 8, padding: "10px 12px", color: "#ffffff", fontSize: 13, outline: "none", fontFamily: "'Geist', sans-serif", resize: "none" }}
                onFocus={e => e.target.style.borderColor = "#ffffff"} onBlur={e => e.target.style.borderColor = "#1a2540"} />
            </div>
          </div>

          {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>{error}</div>}

          <button onClick={handleAnalyze} disabled={loading}
            style={{ padding: "16px", background: loading ? "#111d35" : "#ffffff", color: loading ? "#8aabdd" : "#0a0f1e", border: "none", borderRadius: 12, fontSize: 15, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
            {loading ? "✨ Analyzing your style + upcoming trends..." : "✨ Get My Personalized Style Advice →"}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Summary + Reset */}
          <div style={{ background: "linear-gradient(135deg, #0d1a35, #111d3a)", border: "1px solid #1e3060", borderRadius: 16, padding: 20, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 8 }}>Your Style Profile</div>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 17, color: "#ffffff", lineHeight: 1.6, marginBottom: 8 }}>{result.summary}</p>
              <div style={{ background: "#0a1428", border: "1px solid #1a3a5a", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ffffff" }}>⭐ {result.topOutfit}</div>
            </div>
            <button onClick={() => setResult(null)}
              style={{ padding: "8px 16px", background: "transparent", border: "1px solid #1a2540", borderRadius: 8, color: "#8aabdd", fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              ← Redo
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: "#0d1428", border: "1px solid #1a2540", borderRadius: 12, padding: 4, marginBottom: 16 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ flex: 1, padding: "10px 8px", background: activeTab === t.id ? "#ffffff" : "transparent", color: activeTab === t.id ? "#0a0f1e" : "#8aabdd", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* COLORS TAB */}
          {activeTab === "colors" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4ade80", marginBottom: 14 }}>✅ Colors That Suit You</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.colorPalette?.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: c.hex, border: "1px solid rgba(255,255,255,0.1)", boxShadow: `0 4px 12px ${c.hex}44` }} />
                        {c.trending && <div style={{ position: "absolute", top: -4, right: -4, background: "#4ade80", borderRadius: "50%", width: 14, height: 14, fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: "#ffffff", fontWeight: 500 }}>{c.name} {c.trending && <span style={{ fontSize: 10, color: "#4ade80", marginLeft: 4 }}>TRENDING</span>}</div>
                        <div style={{ fontSize: 11, color: "#4a5a7a" }}>{c.reason}</div>
                        <div style={{ fontSize: 10, color: "#2a3a5a" }}>Best: {c.season}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#f87171", marginBottom: 14 }}>❌ Colors To Avoid</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.avoidColors?.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: c.hex, border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0, opacity: 0.6, filter: "grayscale(30%)" }} />
                      <div>
                        <div style={{ fontSize: 13, color: "#ffffff", fontWeight: 500, textDecoration: "line-through", opacity: 0.7 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "#4a5a7a" }}>{c.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* OUTFITS TAB */}
          {activeTab === "outfits" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {result.outfits?.map((o, i) => (
                <div key={i} style={{ background: "#0d1428", border: `1px solid ${o.trending ? "#4ade8044" : "#1a2540"}`, borderRadius: 14, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 600 }}>{o.name}</div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                      {o.trending && <span style={{ fontSize: 10, background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", borderRadius: 4, padding: "2px 6px" }}>TRENDING</span>}
                      <span style={{ fontSize: 10, background: "#111d35", border: "1px solid #1a2540", color: "#8aabdd", borderRadius: 4, padding: "2px 6px" }}>{o.occasion}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#4a5a7a", lineHeight: 1.5, marginBottom: 10 }}>{o.description}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    {o.colors?.map((c, j) => <span key={j} style={{ fontSize: 11, background: "#1a2540", borderRadius: 4, padding: "2px 8px", color: "#8aabdd" }}>{c}</span>)}
                  </div>
                  {o.tip && <div style={{ fontSize: 11, color: "#4ade80", borderLeft: "2px solid #4ade80", paddingLeft: 8, marginBottom: 8 }}>💡 {o.tip}</div>}
                  <div style={{ fontSize: 11, color: "#4a6aaa" }}>🛍 Buy at: {o.buyAt}</div>
                </div>
              ))}
            </div>
          )}

          {/* TRENDS TAB */}
          {activeTab === "trends" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "#0a1428", border: "1px solid #1a3a5a", borderRadius: 12, padding: 14, fontSize: 13, color: "#8aabdd" }}>
                📈 These trends are predicted for the next 1-3 months, personalized for your profile
              </div>
              {result.futureTrends?.map((t, i) => (
                <div key={i} style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 14, padding: 18, display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "start" }}>
                  <div style={{ background: "#111d35", border: "1px solid #1a2540", borderRadius: 10, padding: "8px 12px", textAlign: "center", minWidth: 60 }}>
                    <div style={{ fontSize: 10, color: "#4ade80", fontWeight: 600, marginBottom: 2 }}>TREND</div>
                    <div style={{ fontSize: 11, color: "#ffffff" }}>{t.when}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 600, marginBottom: 4 }}>{t.trend}</div>
                    <div style={{ fontSize: 12, color: "#4a5a7a", marginBottom: 6 }}>{t.relevance}</div>
                    <div style={{ fontSize: 12, color: "#8aabdd", borderLeft: "2px solid #4a6aaa", paddingLeft: 8 }}>How to wear: {t.howToWear}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BODY TIPS TAB */}
          {activeTab === "body" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 10 }}>✂️ Cuts & Silhouettes</div>
                  <div style={{ fontSize: 13, color: "#ffffff", lineHeight: 1.7 }}>{result.bodyTips}</div>
                </div>
                <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 10 }}>😊 Face & Accessories</div>
                  <div style={{ fontSize: 13, color: "#ffffff", lineHeight: 1.7 }}>{result.faceTips}</div>
                </div>
              </div>
              <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#f87171", marginBottom: 12 }}>🚫 Styles To Avoid</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {result.avoidStyles?.map((s, i) => (
                    <div key={i} style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 13, color: "#f87171", fontWeight: 500, marginBottom: 4 }}>✗ {s.style}</div>
                      <div style={{ fontSize: 11, color: "#4a5a7a" }}>{s.reason}</div>
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