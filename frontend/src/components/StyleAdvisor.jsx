import { useState, useRef } from "react";

const API = "https://trendcast-backend.onrender.com";

const SKIN_TONES = [
  { name: "Fair", hex: "#FDDBB4", desc: "Very light skin" },
  { name: "Light", hex: "#F5C5A3", desc: "Light beige skin" },
  { name: "Medium", hex: "#E8A87C", desc: "Warm medium skin" },
  { name: "Wheatish", hex: "#C68642", desc: "Golden wheatish skin" },
  { name: "Dusky", hex: "#A0522D", desc: "Rich dusky skin" },
  { name: "Deep", hex: "#6B3A2A", desc: "Deep rich skin" },
];

const FACE_SHAPES = ["Oval", "Round", "Square", "Heart", "Diamond", "Oblong"];
const EVENTS = ["Casual Daily", "Office/Work", "Wedding/Festive", "Date Night", "Party", "Outdoor/Travel", "Formal Event"];

export default function StyleAdvisor() {
  const [mode, setMode] = useState("form"); // "form" | "photo"
  const [skinTone, setSkinTone] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [faceShape, setFaceShape] = useState("");
  const [event, setEvent] = useState("");
  const [accessories, setAccessories] = useState("");
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (mode === "form" && !skinTone) return setError("Please select your skin tone.");
    if (mode === "photo" && !imageBase64) return setError("Please upload a photo.");
    setLoading(true); setError(null); setResult(null);
    try {
      const token = localStorage.getItem("tc_token");
      const res = await fetch(`${API}/api/style-advisor`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ skinTone, height, weight, faceShape, event, accessories, imageBase64 }),
      });
      if (!res.ok) throw new Error("Server error: " + res.status);
      const data = await res.json();
      setResult(data.advice);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 40px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 8 }}>AI Powered</div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, letterSpacing: "-0.02em", color: "#ffffff", marginBottom: 8 }}>Personal Style Advisor</h2>
        <p style={{ fontSize: 14, color: "#4a5a7a", lineHeight: 1.6 }}>Get personalized color palettes and outfit recommendations based on your unique features.</p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display: "flex", gap: 4, background: "#0d1428", border: "1px solid #1a2540", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: 28 }}>
        {["form", "photo"].map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: "8px 24px", background: mode === m ? "#ffffff" : "none", color: mode === m ? "#0a0f1e" : "#8aabdd", border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'Geist', sans-serif", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
            {m === "form" ? "📋 Fill Details" : "📸 Upload Photo"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 24 }}>
        {/* Input Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Photo Upload */}
          {(mode === "photo" || mode === "form") && mode === "photo" && (
            <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Upload Your Photo</div>
              <div onClick={() => fileRef.current.click()}
                style={{ border: "2px dashed #1a2540", borderRadius: 12, padding: 32, textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#ffffff"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#1a2540"}>
                {image
                  ? <img src={image} style={{ maxHeight: 200, borderRadius: 8, objectFit: "cover" }} />
                  : <>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                    <div style={{ fontSize: 14, color: "#8aabdd" }}>Click to upload your photo</div>
                    <div style={{ fontSize: 12, color: "#2a3a5a", marginTop: 4 }}>JPG, PNG — AI will analyze your features</div>
                  </>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            </div>
          )}

          {/* Skin Tone */}
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Skin Tone</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {SKIN_TONES.map(tone => (
                <div key={tone.name} onClick={() => setSkinTone(tone.name)}
                  style={{ cursor: "pointer", textAlign: "center", padding: "10px 14px", borderRadius: 10, border: skinTone === tone.name ? "2px solid #ffffff" : "2px solid #1a2540", background: skinTone === tone.name ? "rgba(255,255,255,0.05)" : "transparent", transition: "all 0.2s" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: tone.hex, margin: "0 auto 6px", border: "2px solid rgba(255,255,255,0.1)" }} />
                  <div style={{ fontSize: 12, color: skinTone === tone.name ? "#ffffff" : "#8aabdd", fontWeight: skinTone === tone.name ? 600 : 400 }}>{tone.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Face Shape */}
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Face Shape</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FACE_SHAPES.map(shape => (
                <button key={shape} onClick={() => setFaceShape(shape)}
                  style={{ padding: "8px 16px", background: faceShape === shape ? "#ffffff" : "#111d35", color: faceShape === shape ? "#0a0f1e" : "#8aabdd", border: "1px solid #1a2540", borderRadius: 20, fontSize: 13, fontFamily: "'Geist', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Height & Weight */}
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Body Details</div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: "#4a5a7a", display: "block", marginBottom: 6 }}>Height</label>
                <input value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 5'7&quot; or 170cm"
                  style={{ width: "100%", background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 8, padding: "10px 12px", color: "#ffffff", fontSize: 13, outline: "none", fontFamily: "'Geist', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "#ffffff"} onBlur={e => e.target.style.borderColor = "#1a2540"} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: "#4a5a7a", display: "block", marginBottom: 6 }}>Body Type</label>
                <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. slim, athletic, curvy"
                  style={{ width: "100%", background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 8, padding: "10px 12px", color: "#ffffff", fontSize: 13, outline: "none", fontFamily: "'Geist', sans-serif" }}
                  onFocus={e => e.target.style.borderColor = "#ffffff"} onBlur={e => e.target.style.borderColor = "#1a2540"} />
              </div>
            </div>
          </div>

          {/* Event */}
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Occasion</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {EVENTS.map(e => (
                <button key={e} onClick={() => setEvent(e)}
                  style={{ padding: "8px 14px", background: event === e ? "#ffffff" : "#111d35", color: event === e ? "#0a0f1e" : "#8aabdd", border: "1px solid #1a2540", borderRadius: 20, fontSize: 12, fontFamily: "'Geist', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 12 }}>Accessories You Own</div>
            <input value={accessories} onChange={e => setAccessories(e.target.value)} placeholder="e.g. gold jewellery, silver watch, leather belt..."
              style={{ width: "100%", background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 8, padding: "10px 12px", color: "#ffffff", fontSize: 13, outline: "none", fontFamily: "'Geist', sans-serif" }}
              onFocus={e => e.target.style.borderColor = "#ffffff"} onBlur={e => e.target.style.borderColor = "#1a2540"} />
          </div>

          {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>{error}</div>}

          <button onClick={handleAnalyze} disabled={loading}
            style={{ padding: "14px", background: loading ? "#111d35" : "#ffffff", color: loading ? "#8aabdd" : "#0a0f1e", border: "none", borderRadius: 12, fontSize: 15, fontFamily: "'Geist', sans-serif", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
            {loading ? "✨ Analyzing your style..." : "✨ Get My Style Advice →"}
          </button>
        </div>

        {/* Results Panel */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Overall Style */}
            <div style={{ background: "linear-gradient(135deg, #0d1a35, #111d3a)", border: "1px solid #1e3060", borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 10 }}>Your Style Personality</div>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "#ffffff", lineHeight: 1.6 }}>{result.overallStyle}</p>
            </div>

            {/* Top Pick */}
            <div style={{ background: "#0a1428", border: "1px solid #1a3a5a", borderRadius: 16, padding: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontSize: 24 }}>⭐</div>
              <div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 6 }}>Top Pick For Your Next Event</div>
                <div style={{ fontSize: 14, color: "#ffffff", lineHeight: 1.5 }}>{result.topPick}</div>
              </div>
            </div>

            {/* Color Palette */}
            <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Your Color Palette</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {result.colorPalette?.map((color, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: color.hex, border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0, boxShadow: `0 4px 12px ${color.hex}44` }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 500, marginBottom: 2 }}>{color.name}</div>
                      <div style={{ fontSize: 12, color: "#4a5a7a" }}>{color.reason}</div>
                      <div style={{ fontSize: 11, color: "#2a3a5a", marginTop: 2 }}>Best for: {color.season}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Avoid Colors */}
            {result.avoidColors?.length > 0 && (
              <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#f87171", marginBottom: 16 }}>Colors To Avoid</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {result.avoidColors?.map((color, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: color.hex, border: "1px solid rgba(255,255,255,0.1)" }} />
                      <div>
                        <div style={{ fontSize: 12, color: "#ffffff" }}>{color.name}</div>
                        <div style={{ fontSize: 11, color: "#4a5a7a" }}>{color.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outfit Recommendations */}
            <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 16 }}>Outfit Recommendations</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {result.outfitRecommendations?.map((outfit, i) => (
                  <div key={i} style={{ background: "#0a0f1e", border: "1px solid #1a2540", borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>{outfit.outfit}</div>
                      <div style={{ fontSize: 11, background: "#111d35", border: "1px solid #1a2540", borderRadius: 6, padding: "3px 8px", color: "#8aabdd", whiteSpace: "nowrap", marginLeft: 8 }}>{outfit.occasion}</div>
                    </div>
                    <div style={{ fontSize: 13, color: "#4a5a7a", lineHeight: 1.5, marginBottom: 8 }}>{outfit.description}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {outfit.colors?.map((c, j) => (
                        <span key={j} style={{ fontSize: 11, background: "#1a2540", borderRadius: 4, padding: "2px 8px", color: "#8aabdd" }}>{c}</span>
                      ))}
                    </div>
                    {outfit.tip && <div style={{ fontSize: 12, color: "#4ade80", borderLeft: "2px solid #4ade80", paddingLeft: 8 }}>💡 {outfit.tip}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Face & Body Advice */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {result.faceshapeAdvice && (
                <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 8 }}>Face Shape Tips</div>
                  <div style={{ fontSize: 13, color: "#ffffff", lineHeight: 1.5 }}>{result.faceshapeAdvice}</div>
                </div>
              )}
              {result.bodyAdvice && (
                <div style={{ background: "#0d1428", border: "1px solid #1a2540", borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8aabdd", marginBottom: 8 }}>Body Type Tips</div>
                  <div style={{ fontSize: 13, color: "#ffffff", lineHeight: 1.5 }}>{result.bodyAdvice}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}