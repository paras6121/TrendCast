import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── CORE ANALYST INSTRUCTION ─────────────────────────────────────────────────
// This is the foundation of every Claude call in TrendCast
const ANALYST_SYSTEM_PROMPT = `You are a senior fashion trend analyst specializing in the Indian market.

Your methodology:
- Supplier data is the strongest indicator of future trends. Online data (Amazon, Reddit, YouTube) shows current demand.
- Identify which offline signals are supported by online data
- Classify each trend as Strong, Emerging, or Stable
- Prioritize supplier-backed trends even if online presence is low
- Ignore noise or random mentions

Classification rules:
- STRONG: Offline supplier signal exists AND online data confirms demand
- EMERGING: Offline supplier signal exists but online presence is still low — this is pre-mainstream
- STABLE: No offline signal but consistent online demand — trend is already in market
- DECLINING: Online demand falling, no supplier signal
- NOISE: Random mentions, not a real trend

Always lead your analysis with what the supply chain is saying before referencing online data.`;

// ── MENSWEAR OFFLINE DATA ────────────────────────────────────────────────────
// Pre-loaded from fabric manufacturing contact
export const MENSWEAR_OFFLINE_DATA = {
  source: "Fabric Manufacturing Contact — Direct Industry Intel",
  sourceType: "fabric_supplier",
  confidence: "HIGH",
  leadWeeks: 12,
  addedAt: new Date().toISOString(),
  signals: [
    {
      keyword: "checks shirt",
      pattern: "checks",
      category: "menswear",
      insight: "Fabric supplier seeing significant surge in checks pattern orders for men's shirts. Both classic windowpane and smaller micro-checks moving. Strong order volumes suggest mainstream retail hit in 10-12 weeks.",
      fabricType: "yarn dyed woven",
      colors: ["navy check", "olive check", "burgundy check", "slate grey check"],
      priceSegment: "₹800-₹2500",
      classification: "STRONG",
    },
    {
      keyword: "stripes shirt",
      pattern: "stripes",
      category: "menswear",
      insight: "Vertical stripes in yarn-dyed fabrics getting bulk orders. Muted tones dominating — navy, olive, burgundy on white or cream base. Both slim and regular fit orders coming in equally.",
      fabricType: "yarn dyed cotton",
      colors: ["navy stripe", "olive stripe", "burgundy stripe", "charcoal stripe"],
      priceSegment: "₹700-₹2000",
      classification: "STRONG",
    },
    {
      keyword: "yarn dyed shirt",
      pattern: "yarn dyed",
      category: "menswear",
      insight: "Yarn-dyed fabrics seeing strong order surge across checks, stripes and solids. Premium feel at accessible price. Multiple garment exporters placing bulk orders. Festive and smart-casual positioning.",
      fabricType: "yarn dyed cotton blend",
      colors: ["earthy tones", "muted palette", "navy", "olive", "maroon"],
      priceSegment: "₹1200-₹3500",
      classification: "STRONG",
    },
    {
      keyword: "polyester cotton shirt",
      pattern: "solid",
      category: "menswear",
      insight: "60/40 polyester-cotton blend seeing significant bulk orders from garment exporters targeting mass market. Wrinkle-free finish preferred. Price-sensitive segment. Will hit retail across Tier 1 and Tier 2 cities.",
      fabricType: "polyester cotton blend 60/40",
      colors: ["white", "light blue", "grey", "black"],
      priceSegment: "₹299-₹799",
      classification: "STRONG",
    },
  ],
};

// ── EXTRACT KEYWORDS FROM OFFLINE DATA ──────────────────────────────────────
export async function extractOfflineKeywords(category, offlineSignals) {
  const offlineContext = JSON.stringify(offlineSignals, null, 2);

  const prompt = `${ANALYST_SYSTEM_PROMPT}

A user searched for the category: "${category}"

Here are offline supply chain signals from fabric suppliers and manufacturers:
${offlineContext}

Extract the most specific, searchable keywords from this offline data to scrape Amazon, Reddit and YouTube.

For example if offline data mentions "yarn dyed checks in muted tones" extract:
- "yarn dyed check shirt men"
- "checks shirt india"
- "micro check pattern shirt"

Extract 5-8 highly specific search keywords that will find the most relevant online validation data.

Respond ONLY in this JSON format, no other text:
{
  "extractedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "reasoning": "what the offline data is telling us",
  "primaryTrend": "the single strongest signal",
  "classification": "STRONG|EMERGING|STABLE"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  return JSON.parse(jsonMatch[0]);
}

// ── EXPAND CATEGORY ───────────────────────────────────────────────────────────
export async function expandCategory(category) {
  const lowerCat = category.toLowerCase();
  const isMenswear = lowerCat.includes('men') || lowerCat.includes('shirt') ||
    lowerCat.includes('trouser') || lowerCat.includes('kurta') ||
    lowerCat.includes('check') || lowerCat.includes('stripe');

  let offlineContext = '';
  if (isMenswear) {
    offlineContext = `\n\nOFFLINE SUPPLY CHAIN DATA (prioritize this):
${JSON.stringify(MENSWEAR_OFFLINE_DATA, null, 2)}`;
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `${ANALYST_SYSTEM_PROMPT}

For the category "${category}", list the top 5 most specific trending items right now in India.${offlineContext}

If offline supplier data exists, lead with supplier-backed trends first, then add online-validated ones.

Respond ONLY in this exact JSON format, no other text:
{"category": "${category}", "items": ["item1", "item2", "item3", "item4", "item5"], "offlineInfluenced": true}`,
    }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response');
  return JSON.parse(jsonMatch[0]);
}

// ── CATEGORY INTELLIGENCE ─────────────────────────────────────────────────────
export async function analyzeCategoryIntelligence(category, scrapedData, offlineSignals = {}, offlineExtraction = null) {
  const context = JSON.stringify(scrapedData, null, 2);
  const offlineContext = JSON.stringify(offlineSignals, null, 2);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const hasOffline = Object.keys(offlineSignals).length > 0;

  const prompt = `${ANALYST_SYSTEM_PROMPT}

Today is ${currentMonth}. Generate a category intelligence report for: "${category}"

${hasOffline ? `OFFLINE SUPPLY CHAIN DATA (Tier 1 — highest weight):
${offlineContext}

Offline extraction summary: ${offlineExtraction ? JSON.stringify(offlineExtraction) : 'Not available'}

` : 'No offline supply chain data available for this category. Base analysis on online data only.\n\n'}ONLINE DEMAND DATA (Tier 2 — validation layer, scraped using offline-derived keywords):
${context}

Generate report following the methodology: offline signals define direction, online data validates timing and size.

Respond ONLY in this JSON format:
{
  "category": "${category}",
  "summary": "2-3 sentences — lead with what supply chain is saying, then what online data confirms",
  "dataQuality": "${hasOffline ? 'OFFLINE_VALIDATED' : 'ONLINE_ONLY'}",
  "peakingNow": [
    {
      "item": "specific item name",
      "classification": "STRONG|EMERGING|STABLE",
      "momentum": "EXPLOSIVE|HIGH|MEDIUM|LOW",
      "offlineBacked": true,
      "reason": "supplier says X, online data confirms/shows Y"
    }
  ],
  "fits": [
    { "name": "fit name", "trendScore": 85, "direction": "RISING|STABLE|DECLINING", "offlineBacked": true, "note": "brief note" }
  ],
  "colors": [
    { "name": "color name", "hex": "#hexcode", "trendScore": 90, "direction": "RISING|STABLE|DECLINING", "offlineBacked": true, "peakMonth": "month year" }
  ],
  "fabrics": [
    { "name": "fabric name", "trendScore": 88, "direction": "RISING|STABLE|DECLINING", "offlineBacked": true }
  ],
  "priceSegments": [
    { "range": "Under ₹500", "demand": "HIGH|MEDIUM|LOW", "note": "brief note" }
  ],
  "targetAudience": "who is driving this",
  "seasonalNote": "seasonal context",
  "topRetailerAction": "single most important action right now",
  "offlineSummary": "${hasOffline ? 'summary of what supply chain is telling us' : 'No supply chain data — add offline signals for better accuracy'}"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── PREDICT TRENDS ────────────────────────────────────────────────────────────
export async function predictTrends(aggregatedData, offlineSignals = {}) {
  const context = JSON.stringify(aggregatedData, null, 2);
  const offlineContext = JSON.stringify(offlineSignals, null, 2);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const peakMonth = new Date();
  peakMonth.setMonth(peakMonth.getMonth() + 3);
  const peakMonthStr = peakMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const hasOffline = Object.keys(offlineSignals).length > 0;

  const prompt = `${ANALYST_SYSTEM_PROMPT}

Today is ${currentMonth}. Predict what will trend in India around ${peakMonthStr}.

${hasOffline ? `TIER 1 — OFFLINE SUPPLY CHAIN (50% weight — defines prediction direction):
${offlineContext}

` : 'No offline supply chain signals available. Using online data only — confidence will be moderate.\n\n'}TIER 2 — ONLINE DEMAND DATA (40% weight — validates timing and size):
${context}

For each keyword:
1. Check if offline supply chain data exists → if yes, lead with it
2. Check if online data supports or contradicts the offline signal
3. Classify as STRONG, EMERGING, STABLE or DECLINING
4. Give higher confidence when both tiers align

Respond in this exact JSON format:
{
  "predictions": [
    {
      "keyword": "...",
      "prediction": "Lead with supply chain signal if available, then online validation",
      "confidence": "HIGH|MEDIUM|LOW",
      "classification": "STRONG|EMERGING|STABLE|DECLINING",
      "offlineValidated": true,
      "supplyChainNote": "what supplier data says, or No supply-side data available",
      "onlineValidation": "what online data confirms or contradicts",
      "weeklyMomentum": "e.g. +32% week on week",
      "drivers": ["...", "...", "..."],
      "peakMonth": "${peakMonthStr}",
      "sustainedUntil": "e.g. December 2025",
      "sustainabilityScore": 75,
      "trendPhase": "EMERGING|GROWING|PEAK|DECLINING|DEAD",
      "trendTimeline": [
        { "month": "April 2025", "score": 40 },
        { "month": "May 2025", "score": 60 },
        { "month": "June 2025", "score": 80 },
        { "month": "July 2025", "score": 95 },
        { "month": "August 2025", "score": 85 },
        { "month": "September 2025", "score": 60 }
      ],
      "colors": [
        { "name": "color name", "hex": "#hexcode", "trendScore": 90, "direction": "RISING" }
      ],
      "priceSegments": [
        { "range": "Under ₹500", "demand": "HIGH|MEDIUM|LOW" },
        { "range": "₹500-₹2000", "demand": "HIGH|MEDIUM|LOW" },
        { "range": "₹2000-₹5000", "demand": "HIGH|MEDIUM|LOW" },
        { "range": "Above ₹5000", "demand": "HIGH|MEDIUM|LOW" }
      ],
      "retailerAction": "...",
      "targetAudience": "...",
      "priceRange": "...",
      "compositeScore": 0,
      "timeframeNote": "Based on ${currentMonth}, predicting for ${peakMonthStr}"
    }
  ],
  "overallInsight": "...",
  "topTrend": "...",
  "marketSummary": "...",
  "offlineDataSummary": "${hasOffline ? 'what supply chain signals are collectively telling us' : 'No supply chain data used — add offline signals for stronger predictions'}"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}