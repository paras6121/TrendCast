import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

export async function extractOfflineKeywords(category, offlineSignals) {
  const offlineContext = JSON.stringify(offlineSignals, null, 2);

  const prompt = `${ANALYST_SYSTEM_PROMPT}

A user searched for the category: "${category}"

Here are offline supply chain signals from fabric suppliers and manufacturers:
${offlineContext}

Extract the most specific, searchable keywords from this offline data to scrape Amazon, Reddit and YouTube.

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

export async function expandCategory(category) {
  const lowerCat = category.toLowerCase();
  const isMenswear =
    (lowerCat.includes('check') || lowerCat.includes('stripe') || lowerCat.includes('yarn dyed')) &&
    (lowerCat.includes('shirt') || lowerCat.includes('men'));

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

` : 'No offline supply chain data available for this category. Base analysis on online data only.\n\n'}ONLINE DEMAND DATA (Tier 2 — validation layer):
${context}

Respond ONLY in this JSON format:
{
  "category": "${category}",
  "summary": "2-3 sentences",
  "dataQuality": "${hasOffline ? 'OFFLINE_VALIDATED' : 'ONLINE_ONLY'}",
  "peakingNow": [
    { "item": "specific item name", "classification": "STRONG|EMERGING|STABLE", "momentum": "EXPLOSIVE|HIGH|MEDIUM|LOW", "offlineBacked": true, "reason": "brief reason" }
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
  "offlineSummary": "${hasOffline ? 'summary of supply chain signals' : 'No supply chain data available'}"
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

export async function predictTrends(aggregatedData, offlineSignals = {}) {
  // Only inject offline data if keywords actually match offline signals
  const keywords = aggregatedData.map(d => d.keyword?.toLowerCase() || '');
  const offlineKeywords = ['check', 'stripe', 'yarn dyed', 'polyester cotton'];
  const hasMatch = keywords.some(k => offlineKeywords.some(ok => k.includes(ok)));
  if (!hasMatch) offlineSignals = {};

  const context = JSON.stringify(aggregatedData, null, 2);
  const offlineContext = JSON.stringify(offlineSignals, null, 2);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const peakMonth = new Date();
  peakMonth.setMonth(peakMonth.getMonth() + 3);
  const peakMonthStr = peakMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const hasOffline = Object.keys(offlineSignals).length > 0;

  const prompt = `${ANALYST_SYSTEM_PROMPT}

Today is ${currentMonth}. Predict what will trend in India around ${peakMonthStr}.

IMPORTANT: Only predict trends for the exact keywords provided. Do NOT add unrelated trends.

${hasOffline ? `TIER 1 — OFFLINE SUPPLY CHAIN (50% weight):
${offlineContext}

` : 'No offline supply chain signals available. Using online data only.\n\n'}TIER 2 — ONLINE DEMAND DATA (40% weight):
${context}

Respond in this exact JSON format:
{
  "predictions": [
    {
      "keyword": "exact keyword from input",
      "prediction": "prediction based only on this keyword's data",
      "confidence": "HIGH|MEDIUM|LOW",
      "classification": "STRONG|EMERGING|STABLE|DECLINING",
      "offlineValidated": false,
      "supplyChainNote": "No supply-side data available",
      "onlineValidation": "what online data shows for this keyword",
      "weeklyMomentum": "e.g. +32% week on week",
      "drivers": ["driver1", "driver2", "driver3"],
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
      "retailerAction": "specific action for this keyword only",
      "targetAudience": "who buys this specific item",
      "priceRange": "typical price range",
      "compositeScore": 0,
      "timeframeNote": "Based on ${currentMonth}, predicting for ${peakMonthStr}"
    }
  ],
  "overallInsight": "insight based only on the searched keywords",
  "topTrend": "best performing keyword from the list",
  "marketSummary": "summary of searched keywords only",
  "offlineDataSummary": "${hasOffline ? 'supply chain signals used' : 'No supply chain data used'}"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}