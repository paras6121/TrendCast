import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── CORE ANALYST INSTRUCTION ──────────────────────────────────────────────────
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

// ── MENSWEAR OFFLINE DATA — FROM FABRIC MANUFACTURING CONTACT ─────────────────
export const MENSWEAR_OFFLINE_DATA = {
  source: "Fabric Manufacturing Contact — Direct Industry Intel",
  sourceType: "fabric_supplier",
  confidence: "HIGH",
  leadWeeks: 12,
  addedAt: new Date().toISOString(),
  fitTrend: {
    rising: "loose fit, relaxed fit, oversized, boxy cut, straight cut",
    declining: "slim fit, skinny fit, fitted",
    insight: "Brands are actively moving away from slim and skinny fits across all price segments. Loose, relaxed and straight cuts are dominating new purchase orders for menswear shirts. Oversized and boxy silhouettes particularly strong in urban markets. Skinny fit shirts are being reduced as SKUs across brands.",
    confidence: "HIGH",
  },
  signals: [
    {
      keyword: "checks shirt",
      pattern: "checks",
      category: "menswear shirts",
      insight: "Brands showing very strong interest in checks for men's shirts. Classic windowpane checks, micro-checks and bold checks all moving well. Loose fit and boxy cuts strongly preferred over slim. Yarn-dyed checks in muted earthy tones dominating orders. One of the top priorities for upcoming season.",
      fabricType: "yarn dyed woven cotton",
      fit: "loose fit, relaxed fit, boxy cut",
      colors: ["navy check", "olive check", "burgundy check", "slate grey check", "beige check", "brown check", "mustard check"],
      priceSegment: "₹800-₹2500",
      classification: "STRONG",
    },
    {
      keyword: "stripes shirt",
      pattern: "stripes",
      category: "menswear shirts",
      insight: "Vertical stripes in yarn-dyed fabrics seeing strong brand interest. Muted tones dominating — navy, olive, burgundy on white or cream base. Loose and straight fit strongly preferred. Both casual and smart-casual positioning working well.",
      fabricType: "yarn dyed cotton",
      fit: "loose fit, straight cut, relaxed",
      colors: ["navy stripe", "olive stripe", "burgundy stripe", "charcoal stripe", "brown stripe", "forest green stripe"],
      priceSegment: "₹700-₹2000",
      classification: "STRONG",
    },
    {
      keyword: "linen shirt",
      pattern: "solid and textured",
      category: "menswear shirts",
      insight: "Pure linen is the top fabric priority for upcoming season. Brands placing very strong orders. Loose and relaxed fit is the only preferred silhouette — structured boxy linen shirts particularly in demand. Both solid and textured linen moving. This is the single biggest trend signal in menswear right now.",
      fabricType: "pure linen, linen cotton blend",
      fit: "loose fit, relaxed boxy cut, oversized",
      colors: ["off-white", "beige", "olive", "stone", "sage green", "dusty rose", "sky blue", "rust", "camel"],
      priceSegment: "₹1200-₹4000",
      classification: "STRONG",
    },
    {
      keyword: "blended linen shirt",
      pattern: "solid and textured",
      category: "menswear shirts",
      insight: "Linen blends — linen-cotton, linen-viscose, linen-polyester — getting bulk orders from brands targeting mid and mass market. More affordable than pure linen but retains the texture and drape. Brands targeting ₹600-₹2000 price point with blended linen in loose relaxed cuts.",
      fabricType: "linen cotton blend, linen viscose blend, linen polyester blend",
      fit: "loose fit, relaxed straight cut",
      colors: ["beige", "off-white", "light grey", "olive", "terracotta", "sage green", "powder blue"],
      priceSegment: "₹600-₹2000",
      classification: "STRONG",
    },
    {
      keyword: "yarn dyed shirt",
      pattern: "yarn dyed checks and stripes",
      category: "menswear shirts",
      insight: "Yarn-dyed fabrics in checks and stripes seeing strong order surge across all brand tiers. Premium feel at accessible price. Loose and relaxed silhouette exclusively preferred. Festive and smart-casual positioning with earthy muted tones.",
      fabricType: "yarn dyed cotton blend, yarn dyed linen blend",
      fit: "loose fit, relaxed boxy",
      colors: ["earthy tones", "muted palette", "navy", "olive", "maroon", "mustard", "forest green"],
      priceSegment: "₹1200-₹3500",
      classification: "STRONG",
    },
    {
      keyword: "polyester cotton shirt",
      pattern: "solid",
      category: "menswear shirts",
      insight: "60/40 polyester-cotton blend seeing bulk orders for mass market. Wrinkle-free finish preferred. Loose straight cut replacing slim fit even in this budget segment. Tier 1 and Tier 2 city brands ordering heavily.",
      fabricType: "polyester cotton blend 60/40",
      fit: "loose fit, straight cut — skinny fit declining even here",
      colors: ["white", "light blue", "grey", "black", "navy", "olive"],
      priceSegment: "₹299-₹799",
      classification: "STRONG",
    },
  ],
  keyInsights: [
    "LOOSE FIT IS THE DOMINANT TREND — replacing slim and skinny across all price segments",
    "Linen and linen blends are the #1 fabric priority for the upcoming season",
    "Checks in yarn-dyed fabric are the #1 pattern priority for menswear shirts",
    "Stripes in yarn-dyed fabric are the #2 pattern priority",
    "Muted earthy color palette dominating — olive, beige, navy, burgundy, stone, sage",
    "Skinny fit and slim fit shirts are actively DECLINING — brands reducing these SKUs",
    "Boxy oversized silhouettes strongest in urban premium segment ₹2000+",
    "Smart-casual positioning dominating over formal for shirts",
    "Blended linen is opening up mid-market access to the linen trend",
    "Brands interested in: stripes, linens, checks, blended linens — all in loose/relaxed fits",
  ],
};

// ── EXTRACT KEYWORDS FROM OFFLINE DATA ───────────────────────────────────────
export async function extractOfflineKeywords(category, offlineSignals) {
  const offlineContext = JSON.stringify(offlineSignals, null, 2);

  const prompt = `${ANALYST_SYSTEM_PROMPT}

A user searched for the category: "${category}"

Here are offline supply chain signals from fabric suppliers and manufacturers:
${offlineContext}

Extract the most specific, searchable keywords from this offline data to scrape Amazon, Reddit and YouTube.
Focus on the actual product names and styles that are being ordered in bulk.

Respond ONLY in this JSON format, no other text:
{
  "extractedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "reasoning": "what the offline data is telling us in 1-2 sentences",
  "primaryTrend": "the single strongest signal from supplier data",
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
  const isMenswear = /men|shirt|trouser|check|stripe|yarn|polyester|kurta|blazer|jacket|linen|blend/i.test(lowerCat);

  let offlineContext = '';
  if (isMenswear) {
    offlineContext = `\n\nOFFLINE SUPPLY CHAIN DATA — prioritize these trends:
Key insights: ${MENSWEAR_OFFLINE_DATA.keyInsights.join(' | ')}
Top signals: Linen shirts (loose fit), checks shirts (yarn dyed, loose fit), stripes shirts (yarn dyed, loose fit), blended linen shirts
Fit direction: Loose/relaxed/boxy RISING. Slim/skinny DECLINING.`;
  }

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `${ANALYST_SYSTEM_PROMPT}

For the category "${category}", list the top 5 most specific trending items right now in India.${offlineContext}

If offline supplier data exists for this category, lead with supplier-backed trends first.

Respond ONLY in this exact JSON format, no other text:
{"category": "${category}", "items": ["item1", "item2", "item3", "item4", "item5"], "offlineInfluenced": ${isMenswear}}`,
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
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const hasOffline = Object.keys(offlineSignals).length > 0;
  const offlineContext = hasOffline ? JSON.stringify(offlineSignals, null, 2) : null;

  const prompt = `${ANALYST_SYSTEM_PROMPT}

Today is ${currentMonth}. Generate a category intelligence report for: "${category}"

${hasOffline
  ? `OFFLINE SUPPLY CHAIN DATA (Tier 1 — highest weight, defines the direction):
${offlineContext}

Key offline extraction: ${offlineExtraction ? JSON.stringify(offlineExtraction.reasoning) : 'Not available'}
`
  : `No offline supply chain data for "${category}". Base your entire analysis on the online scraped data. Still give a complete detailed report with all sections filled.`}

ONLINE SCRAPED DATA (validation layer — searched using supplier-derived keywords):
${context}

IMPORTANT RULES:
- Return ONLY valid JSON. No markdown. No explanation. No backticks. Pure JSON only.
- All string values must be plain text — no HTML, no JSX, no markdown inside strings.
- Fill ALL sections even if data is limited — make educated expert assessments.
- For fits section: if menswear, loose/relaxed/boxy should score highest, slim/skinny should score lowest.

Return this exact JSON:
{
  "category": "${category}",
  "summary": "2-3 plain text sentences. Lead with supply chain signals if available, then online validation.",
  "dataQuality": "${hasOffline ? 'OFFLINE_VALIDATED' : 'ONLINE_ONLY'}",
  "peakingNow": [
    { "item": "specific item name", "classification": "STRONG", "momentum": "HIGH", "offlineBacked": ${hasOffline}, "reason": "plain text reason" },
    { "item": "specific item name", "classification": "EMERGING", "momentum": "MEDIUM", "offlineBacked": ${hasOffline}, "reason": "plain text reason" },
    { "item": "specific item name", "classification": "STABLE", "momentum": "MEDIUM", "offlineBacked": false, "reason": "plain text reason" }
  ],
  "fits": [
    { "name": "Loose Fit", "trendScore": 92, "direction": "RISING", "offlineBacked": ${hasOffline}, "note": "Dominant silhouette across all segments" },
    { "name": "Relaxed Fit", "trendScore": 88, "direction": "RISING", "offlineBacked": ${hasOffline}, "note": "Strong in mid and premium segment" },
    { "name": "Boxy Oversized", "trendScore": 82, "direction": "RISING", "offlineBacked": ${hasOffline}, "note": "Urban premium segment" },
    { "name": "Straight Cut", "trendScore": 74, "direction": "STABLE", "offlineBacked": ${hasOffline}, "note": "Consistent across all prices" },
    { "name": "Slim Fit", "trendScore": 35, "direction": "DECLINING", "offlineBacked": false, "note": "Brands reducing slim fit SKUs" },
    { "name": "Skinny Fit", "trendScore": 18, "direction": "DECLINING", "offlineBacked": false, "note": "Actively declining — avoid stocking" }
  ],
  "colors": [
    { "name": "color name", "hex": "#hexcode", "trendScore": 90, "direction": "RISING", "offlineBacked": ${hasOffline}, "peakMonth": "specific month year" },
    { "name": "color name", "hex": "#hexcode", "trendScore": 85, "direction": "RISING", "offlineBacked": ${hasOffline}, "peakMonth": "specific month year" },
    { "name": "color name", "hex": "#hexcode", "trendScore": 78, "direction": "RISING", "offlineBacked": ${hasOffline}, "peakMonth": "specific month year" },
    { "name": "color name", "hex": "#hexcode", "trendScore": 70, "direction": "STABLE", "offlineBacked": false, "peakMonth": "specific month year" },
    { "name": "color name", "hex": "#hexcode", "trendScore": 55, "direction": "STABLE", "offlineBacked": false, "peakMonth": "specific month year" }
  ],
  "fabrics": [
    { "name": "fabric name", "trendScore": 92, "direction": "RISING", "offlineBacked": ${hasOffline} },
    { "name": "fabric name", "trendScore": 85, "direction": "RISING", "offlineBacked": ${hasOffline} },
    { "name": "fabric name", "trendScore": 75, "direction": "STABLE", "offlineBacked": false },
    { "name": "fabric name", "trendScore": 60, "direction": "STABLE", "offlineBacked": false }
  ],
  "priceSegments": [
    { "range": "Under ₹500", "demand": "MEDIUM", "note": "plain text note about this segment" },
    { "range": "₹500-₹2000", "demand": "HIGH", "note": "plain text note about this segment" },
    { "range": "₹2000-₹5000", "demand": "HIGH", "note": "plain text note about this segment" },
    { "range": "Above ₹5000", "demand": "MEDIUM", "note": "plain text note about this segment" }
  ],
  "targetAudience": "plain text description of who is buying this",
  "seasonalNote": "plain text seasonal context for India",
  "topRetailerAction": "single most important plain text action for a retailer right now",
  "offlineSummary": "${hasOffline ? 'plain text: what the supply chain is telling us and why this matters' : 'No supply chain data for this category. Results based on online demand signals. Add supplier intel for stronger predictions.'}"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    const clean = jsonMatch[0]
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');
    return JSON.parse(clean);
  }
}

// ── PREDICT TRENDS ────────────────────────────────────────────────────────────
export async function predictTrends(aggregatedData, offlineSignals = {}) {
  const offlineKeywords = [
    'check', 'checks', 'stripe', 'stripes', 'yarn dyed', 'linen',
    'blended linen', 'linen blend', 'polyester cotton', 'shirt', 'shirts',
    'loose fit', 'relaxed fit', 'menswear', 'men shirt',
  ];

  const keywords = aggregatedData.map(d => (d.keyword || '').toLowerCase());
  const hasMatch = keywords.some(k => offlineKeywords.some(ok => k.includes(ok)));
  if (!hasMatch) offlineSignals = {};

  const context = JSON.stringify(aggregatedData, null, 2);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const peakMonth = new Date();
  peakMonth.setMonth(peakMonth.getMonth() + 3);
  const peakMonthStr = peakMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const hasOffline = Object.keys(offlineSignals).length > 0;
  const offlineContext = hasOffline ? JSON.stringify(offlineSignals, null, 2) : null;

  const prompt = `${ANALYST_SYSTEM_PROMPT}

Today is ${currentMonth}. Predict what will trend in India around ${peakMonthStr}.

IMPORTANT: Only generate predictions for the exact keywords provided. Do not add extra keywords.

${hasOffline
  ? `TIER 1 — OFFLINE SUPPLY CHAIN DATA (50% weight — defines prediction direction):
${offlineContext}

Key fit direction from supplier: Loose/relaxed/boxy RISING strongly. Slim/skinny DECLINING.
`
  : `No offline supply chain signals for these keywords. Base predictions on online data only. Confidence will be MEDIUM unless online data is very strong.`}

TIER 2 — ONLINE DEMAND DATA (validation layer):
${context}

For each keyword:
1. If offline signal exists → lead with it, use online data to validate timing
2. If no offline signal → base on online data, note absence of supply validation
3. Classify: STRONG (both align), EMERGING (offline only), STABLE (online only), DECLINING

Respond in this exact JSON format only — no markdown, no extra text:
{
  "predictions": [
    {
      "keyword": "exact keyword from input",
      "prediction": "2-3 sentences. Lead with supply chain if available. Then online validation. Be specific about fit, fabric and color directions.",
      "confidence": "HIGH",
      "classification": "STRONG",
      "offlineValidated": ${hasOffline},
      "supplyChainNote": "what supplier data says specifically, or No supply-side data available for this keyword",
      "onlineValidation": "what Amazon Reddit YouTube data confirms or contradicts",
      "weeklyMomentum": "+X% week on week or stable",
      "drivers": ["specific driver 1", "specific driver 2", "specific driver 3"],
      "peakMonth": "${peakMonthStr}",
      "sustainedUntil": "Month Year",
      "sustainabilityScore": 80,
      "trendPhase": "EMERGING",
      "trendTimeline": [
        { "month": "May 2025", "score": 55 },
        { "month": "June 2025", "score": 70 },
        { "month": "July 2025", "score": 88 },
        { "month": "August 2025", "score": 95 },
        { "month": "September 2025", "score": 85 },
        { "month": "October 2025", "score": 70 }
      ],
      "colors": [
        { "name": "Olive Green", "hex": "#6B7F3A", "trendScore": 88, "direction": "RISING" },
        { "name": "Beige", "hex": "#D4B896", "trendScore": 82, "direction": "RISING" },
        { "name": "Navy", "hex": "#1B3A6B", "trendScore": 75, "direction": "STABLE" }
      ],
      "priceSegments": [
        { "range": "Under ₹500", "demand": "LOW" },
        { "range": "₹500-₹2000", "demand": "HIGH" },
        { "range": "₹2000-₹5000", "demand": "HIGH" },
        { "range": "Above ₹5000", "demand": "MEDIUM" }
      ],
      "retailerAction": "specific actionable advice for a retailer stocking this item right now",
      "targetAudience": "who is buying this and from where",
      "priceRange": "₹X-₹Y typical retail range",
      "compositeScore": 0,
      "timeframeNote": "Based on ${currentMonth}, predicting for ${peakMonthStr}"
    }
  ],
  "overallInsight": "2-3 sentence insight about what these keywords collectively tell us about the market right now",
  "topTrend": "the single best performing keyword",
  "marketSummary": "1-2 sentences summarizing the market direction for these specific keywords",
  "offlineDataSummary": "${hasOffline ? 'what supply chain signals are collectively telling us about these trends' : 'No supply chain data used for this prediction. Add offline signals for stronger accuracy.'}"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    const clean = jsonMatch[0]
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');
    return JSON.parse(clean);
  }
}