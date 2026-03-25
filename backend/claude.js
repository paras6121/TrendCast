import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function expandCategory(category) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: `You are a fashion trend expert. For the category "${category}", list the top 5 most specific trending items right now in India. Respond in this exact JSON format only, no other text: {"category": "${category}", "items": ["item1", "item2", "item3", "item4", "item5"]}` }],
  });
  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response');
  return JSON.parse(jsonMatch[0]);
}

export async function analyzeCategoryIntelligence(category, scrapedData) {
  const context = JSON.stringify(scrapedData, null, 2);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const prompt = `You are a senior fashion trend analyst for the Indian market. Today is ${currentMonth}.

A user wants a deep category intelligence report for: "${category}"

Here is scraped data from Amazon, Reddit, YouTube and Google for related keywords:
${context}

Provide a comprehensive category intelligence report. Respond in this exact JSON format only:
{
  "category": "${category}",
  "summary": "2-3 sentence overview of what is happening in this category right now in India",
  "peakingNow": [
    { "item": "e.g. wide leg cargo pants", "momentum": "EXPLOSIVE|HIGH|MEDIUM|LOW", "reason": "why this is peaking" }
  ],
  "fits": [
    { "name": "e.g. Oversized", "trendScore": 85, "direction": "RISING|STABLE|DECLINING", "note": "brief note" }
  ],
  "colors": [
    { "name": "e.g. Olive green", "hex": "#6B7F3A", "trendScore": 90, "direction": "RISING|STABLE|DECLINING", "peakMonth": "e.g. June 2025" }
  ],
  "fabrics": [
    { "name": "e.g. Linen", "trendScore": 88, "direction": "RISING|STABLE|DECLINING" }
  ],
  "priceSegments": [
    { "range": "Under ₹500", "demand": "HIGH|MEDIUM|LOW", "note": "brief note" }
  ],
  "targetAudience": "who is driving this category",
  "seasonalNote": "any seasonal factors affecting this category",
  "topRetailerAction": "single most important action for a retailer right now"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}

export async function predictTrends(aggregatedData) {
  const context = JSON.stringify(aggregatedData, null, 2);
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const peakMonth = new Date();
  peakMonth.setMonth(peakMonth.getMonth() + 3);
  const peakMonthStr = peakMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prompt = `You are a fashion trend analyst specializing in the Indian market. Today is ${currentMonth}.

Analyze this multi-source data and predict what will be trending in India in 3 months (around ${peakMonthStr}).

Data: ${context}

Respond in this exact JSON format:
{
  "predictions": [
    {
      "keyword": "...",
      "prediction": "...",
      "confidence": "HIGH|MEDIUM|LOW",
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
        { "name": "e.g. Olive green", "hex": "#6B7F3A", "trendScore": 90, "direction": "RISING" },
        { "name": "e.g. Beige", "hex": "#D4B896", "trendScore": 75, "direction": "RISING" },
        { "name": "e.g. Black", "hex": "#1a1a1a", "trendScore": 65, "direction": "STABLE" }
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
  "marketSummary": "..."
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');
  return JSON.parse(jsonMatch[0]);
}
