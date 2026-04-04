import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { hashPassword, comparePassword, generateToken, requireAuth } from './auth.js';
import { findUserByEmail, createUser, findOrCreateGoogleUser, findUserById } from './users.js';

import { scrapeGoogleTrends } from './scrapers/googleTrends.js';
import { scrapeAmazon } from './scrapers/amazon.js';
import { scrapeYoutube } from './scrapers/youtube.js';
import { scrapeReddit } from './scrapers/reddit.js';
import { scrapeGoogleShopping } from './scrapers/googleshopping_new.js';
import { scrapeTwitter } from './scrapers/twitter.js';
import { simulateMyntra } from './scrapers/simulated.js';
import { aggregateData } from './aggregator.js';
import { predictTrends, expandCategory, analyzeCategoryIntelligence, extractOfflineKeywords, MENSWEAR_OFFLINE_DATA } from './claude.js';
import { generateTrendReport } from './PdfGenerator.js';
import { addToWatchlist, getWatchlist, removeFromWatchlist, updateWatchlistScore } from './watchlist.js';
import { getSignalsForKeywords } from './offlineSignals.js';

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret_change_me',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// ── GOOGLE OAUTH ──────────────────────────────────────────────────────────────

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://trendcast-backend.onrender.com/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = findOrCreateGoogleUser({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      avatar: profile.photos?.[0]?.value || null,
    });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = findUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ── AUTH ROUTES ───────────────────────────────────────────────────────────────

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}?error=google_failed` }),
  (req, res) => {
    const token = generateToken({ id: req.user.id, email: req.user.email, name: req.user.name, avatar: req.user.avatar });
    res.redirect(`${FRONTEND_URL}?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&avatar=${encodeURIComponent(req.user.avatar || '')}`);
  }
);

app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  try {
    if (findUserByEmail(email)) return res.status(409).json({ error: 'An account with this email already exists.' });
    const passwordHash = await hashPassword(password);
    const user = createUser({ email, passwordHash, name });
    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error('[Signup] Error:', err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  try {
    const user = findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    if (!user.passwordHash) return res.status(401).json({ error: 'This account uses Google sign-in. Please continue with Google.' });
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });
    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('[Login] Error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ── HELPERS ───────────────────────────────────────────────────────────────────

function withTimeout(promise, ms, fallback) {
  return Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(fallback), ms))]);
}

function isMenswearKeyword(keyword) {
  return /men|shirt|trouser|check|stripe|yarn|polyester|kurta|blazer|jacket/i.test(keyword);
}

async function buildOfflineData(keywords) {
  const hasMenswear = keywords.some(k => isMenswearKeyword(k));
  const dbOfflineData = await getSignalsForKeywords(keywords);
  return {
    ...(hasMenswear ? { menswear: MENSWEAR_OFFLINE_DATA } : {}),
    ...dbOfflineData,
  };
}

// ── CATEGORY INTELLIGENCE ─────────────────────────────────────────────────────

app.post('/api/category-intelligence', requireAuth, async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: 'Provide a category' });
  try {
    console.log('[CategoryIntel] Starting for: ' + category);

    const offlineData = await buildOfflineData([
      category,
      category + ' fabric',
      category + ' pattern',
      category + ' style',
    ]);

    const hasOfflineData = Object.keys(offlineData).length > 0;
    let offlineExtraction = null;
    let scrapeKeywords = [];

    if (hasOfflineData) {
      console.log('[CategoryIntel] Offline data found — extracting targeted keywords...');
      offlineExtraction = await extractOfflineKeywords(category, offlineData);
      scrapeKeywords = offlineExtraction?.extractedKeywords || [];
      console.log('[CategoryIntel] Extracted:', scrapeKeywords.join(', '));
    }

    if (scrapeKeywords.length === 0) {
      scrapeKeywords = [category, category + ' trending india', category + ' style 2025'];
    }

    const kws = scrapeKeywords.slice(0, 4);
    console.log('[CategoryIntel] Scraping with:', kws.join(', '));

    const emptyAmazon  = kws.map(k => ({ source: 'amazon', keyword: k, totalResults: 0, topItems: [] }));
    const emptyReddit  = kws.map(k => ({ source: 'reddit', keyword: k, totalPosts: 0, topTerms: [] }));
    const emptyYoutube = kws.map(k => ({ source: 'youtube', keyword: k, videoCount: 0, topTerms: [] }));

    const [amazonData, redditData, youtubeData] = await Promise.all([
      withTimeout(scrapeAmazon(kws),  20000, emptyAmazon),
      withTimeout(scrapeReddit(kws),  15000, emptyReddit),
      withTimeout(scrapeYoutube(kws), 15000, emptyYoutube),
    ]);

    const intelligence = await analyzeCategoryIntelligence(
      category,
      { amazonData, redditData, youtubeData, category },
      offlineData,
      offlineExtraction
    );

    res.json({
      success: true,
      intelligence,
      offlineSignalsUsed: hasOfflineData,
      extractedKeywords: kws,
      offlineExtraction,
    });

  } catch (err) {
    console.error('[CategoryIntelligence] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── EXPAND CATEGORY ───────────────────────────────────────────────────────────

app.post('/api/expand-category', requireAuth, async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: 'Provide a category' });
  try {
    const expanded = await expandCategory(category);
    res.json({ success: true, ...expanded });
  } catch (err) {
    console.error('[Expand] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PREDICT ───────────────────────────────────────────────────────────────────

app.post('/api/predict', requireAuth, async (req, res) => {
  const { keywords } = req.body;
  if (!keywords || !Array.isArray(keywords) || keywords.length === 0)
    return res.status(400).json({ error: 'Provide an array of keywords' });
  const kws = keywords.slice(0, 5);
  try {
    console.log('[Server] Starting scrape for: ' + kws.join(', '));

    const emptyGoogle   = kws.map(k => ({ source: 'google_trends', keyword: k, thisWeekScore: 0, lastWeekScore: 0, weeklyChange: 0, trend: 'UNKNOWN' }));
    const emptyAmazon   = kws.map(k => ({ source: 'amazon', keyword: k, totalResults: 0, newArrivalsThisWeek: 0, bestsellerCount: 0, topItems: [], demandSignal: 'LOW' }));
    const emptyYoutube  = kws.map(k => ({ source: 'youtube', keyword: k, videoCount: 0, avgViews: 0, trendSignal: 'EMERGING', topTerms: [] }));
    const emptyReddit   = kws.map(k => ({ source: 'reddit', keyword: k, totalPosts: 0, thisWeekPosts: 0, avgScore: 0, engagementSignal: 'LOW' }));
    const emptyShopping = kws.map(k => ({ source: 'google_shopping', keyword: k, totalProducts: 0, avgPrice: 0, demandSignal: 'LOW', topProducts: [] }));
    const emptyTwitter  = kws.map(k => ({ source: 'twitter', keyword: k, tweetCount: 0, avgEngagement: 0, viralSignal: 'EMERGING', topTerms: [] }));

    const [googleData, amazonData, youtubeData, redditData, googleShoppingData, twitterData] = await Promise.all([
      withTimeout(scrapeGoogleTrends(kws),   30000, emptyGoogle),
      withTimeout(scrapeAmazon(kws),         20000, emptyAmazon),
      withTimeout(scrapeYoutube(kws),        15000, emptyYoutube),
      withTimeout(scrapeReddit(kws),         15000, emptyReddit),
      withTimeout(scrapeGoogleShopping(kws), 20000, emptyShopping),
      withTimeout(scrapeTwitter(kws),        15000, emptyTwitter),
    ]);

    const myntraData = simulateMyntra(kws);

    console.log('[Server] Scraping complete. Aggregating...');
    const aggregated = aggregateData({
      googleData, amazonData, youtubeData, redditData,
      myntraData, googleShoppingData, twitterData,
      keywords: kws,
    });

    // Build offline data and inject into predictions
    const offlineData = await buildOfflineData(kws);
    if (Object.keys(offlineData).length > 0) {
      console.log('[Server] Offline data injected for:', Object.keys(offlineData).join(', '));
    } else {
      console.log('[Server] No offline data for these keywords — using online only');
    }

    console.log('[Server] Calling Claude for predictions...');
    const predictions = await predictTrends(aggregated, offlineData);

    for (const kw of kws) {
      const raw = aggregated.find(r => r.keyword === kw);
      if (raw) await updateWatchlistScore(kw, raw.compositeScore, raw.signals?.googleTrends?.trend || 'STABLE');
    }

    res.json({ success: true, keywords: kws, predictions, rawScores: aggregated });
  } catch (err) {
    console.error('[Server] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PDF REPORT ────────────────────────────────────────────────────────────────

app.post('/api/download-report', requireAuth, async (req, res) => {
  const { predictions, rawScores, keywords } = req.body;
  try {
    const pdfBuffer = await generateTrendReport(predictions, rawScores, keywords);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="trendcast-report.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('[PDF] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── WATCHLIST ─────────────────────────────────────────────────────────────────

app.post('/api/watchlist/add', requireAuth, async (req, res) => {
  const { keyword, email } = req.body;
  if (!keyword) return res.status(400).json({ error: 'Provide a keyword' });
  try {
    const result = await addToWatchlist(keyword, email);
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/watchlist', requireAuth, async (req, res) => {
  try {
    const items = await getWatchlist(req.query.email);
    res.json({ success: true, items });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/watchlist/:id', requireAuth, async (req, res) => {
  try {
    const result = await removeFromWatchlist(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── STYLE ADVISOR ─────────────────────────────────────────────────────────────

app.post('/api/style-advisor', requireAuth, async (req, res) => {
  const { skinTone, height, weight, faceShape, event, accessories, imageBase64, budget } = req.body;
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    let content = [];
    if (imageBase64) {
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } });
    }

    content.push({ type: 'text', text: `You are a professional fashion stylist specializing in Indian fashion and skin tones.

Analyze the following person and provide personalized styling advice:
${skinTone ? `- Skin tone: ${skinTone}` : ''}
${height ? `- Height: ${height}` : ''}
${weight ? `- Body type/weight: ${weight}` : ''}
${faceShape ? `- Face shape: ${faceShape}` : ''}
${event ? `- Occasion/Event: ${event}` : ''}
${accessories ? `- Accessories they have: ${accessories}` : ''}
${budget ? `- Budget: ${budget}` : ''}
${imageBase64 ? '- A photo has been provided, analyze their features from it.' : ''}

Respond ONLY with a valid JSON object, no markdown, no extra text:
{
  "colorPalette": [
    { "name": "color name", "hex": "#hexcode", "reason": "why this color suits them", "season": "when to wear" }
  ],
  "avoidColors": [
    { "name": "color name", "hex": "#hexcode", "reason": "why to avoid" }
  ],
  "outfitRecommendations": [
    { "outfit": "outfit name", "description": "detailed description", "colors": ["color1", "color2"], "occasion": "when to wear", "tip": "styling tip" }
  ],
  "faceshapeAdvice": "advice about necklines and accessories for their face shape",
  "bodyAdvice": "advice about cuts and silhouettes for their body type",
  "overallStyle": "their overall style personality in 2-3 sentences",
  "topPick": "the single best outfit recommendation for their next event"
}` });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content }]
    });

    const raw = message.content[0].text.replace(/```json|```/g, '').trim();
    const advice = JSON.parse(raw);
    res.json({ success: true, advice });
  } catch (err) {
    console.error('[StyleAdvisor] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PERSONALIZED STYLING ──────────────────────────────────────────────────────

app.post('/api/personalized-styling', requireAuth, async (req, res) => {
  const { gender, skinTone, height, weight, bodyType, faceShape, event, accessories, imageBase64, budget } = req.body;
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const genderLower = (gender || '').toLowerCase();
    const isMale = genderLower.includes('male') || genderLower.includes('man') || genderLower.includes('boy');
    const isFemale = genderLower.includes('female') || genderLower.includes('woman') || genderLower.includes('girl');

    const genderRule = isMale
      ? `STRICT RULE: This person is MALE. Only suggest men's clothing ONLY:
         - Shirts (formal, casual, check, stripe, linen, denim)
         - Trousers, chinos, cargo pants, jeans
         - Kurtas (men's), sherwanis, bandhgalas
         - Jackets, blazers, waistcoats
         - Shorts, joggers, activewear for men
         - NEVER suggest: dresses, sarees, lehengas, skirts, blouses, women's kurtas, feminine cuts
         - buyAt must say "Men's" e.g. "Myntra Men", "Amazon Men's Fashion", "Ajio Men"`
      : isFemale
      ? `STRICT RULE: This person is FEMALE. Only suggest women's clothing ONLY:
         - Dresses, co-ord sets, tops, blouses
         - Women's kurtas, salwar suits, lehengas, sarees
         - Skirts, palazzos, wide leg trousers for women
         - Women's jackets, cardigans, blazers
         - NEVER suggest: men's shirts, men's trousers, masculine cuts
         - buyAt must say "Women's" e.g. "Myntra Women", "Amazon Women's Fashion", "Ajio Women"`
      : `Suggest gender-neutral or unisex clothing appropriate for Indian fashion.`;

    let content = [];
    if (imageBase64) {
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } });
    }

    content.push({ type: 'text', text: `You are an expert Indian fashion stylist and color analyst. Analyze this person and give highly personalized styling advice considering upcoming Indian fashion trends for the next 3 months.

${genderRule}

Person details:
- Gender: ${gender || 'Not specified'}
- Skin tone: ${skinTone || 'Not specified'}
- Height: ${height || 'Not specified'}
- Weight/Body: ${weight || 'Not specified'}
- Body type: ${bodyType || 'Not specified'}
- Face shape: ${faceShape || 'Not specified'}
- Occasion: ${event || 'General/Daily'}
- Accessories owned: ${accessories || 'None specified'}
- Budget: ${budget || 'Not specified'}
${imageBase64 ? '- Photo provided: analyze visible features' : ''}

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "summary": "2-3 sentence personalized style summary mentioning gender and upcoming trends",
  "colorPalette": [
    { "name": "color name", "hex": "#hexcode", "reason": "why suits this person", "trending": true, "season": "when to wear" }
  ],
  "avoidColors": [
    { "name": "color name", "hex": "#hexcode", "reason": "why to avoid for this skin tone" }
  ],
  "outfits": [
    { "name": "gender-appropriate outfit name", "description": "detailed description of exactly what to wear", "colors": ["color1"], "occasion": "when to wear", "buyAt": "Myntra Men/Women or Amazon Men/Women Fashion", "tip": "styling tip", "trending": true }
  ],
  "futureTrends": [
    { "trend": "gender-appropriate upcoming trend", "relevance": "why relevant for this person", "when": "next 1-3 months", "howToWear": "specific advice for their body type" }
  ],
  "avoidStyles": [
    { "style": "style or cut to avoid", "reason": "specific reason for their body type and gender" }
  ],
  "bodyTips": "detailed advice on cuts, fits and silhouettes for this gender and body type",
  "faceTips": "neckline and accessory advice for their face shape",
  "topOutfit": "single best gender-appropriate outfit for their next event"
}` });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content }]
    });

    const raw = message.content[0].text.replace(/```json|```/g, '').trim();
    let advice;
    try {
      advice = JSON.parse(raw);
    } catch {
      let fixed = raw;
      let braces = 0, brackets = 0;
      for (const ch of fixed) {
        if (ch === '{') braces++;
        else if (ch === '}') braces--;
        else if (ch === '[') brackets++;
        else if (ch === ']') brackets--;
      }
      const lastComplete = fixed.lastIndexOf('},');
      if (lastComplete > 0) fixed = fixed.substring(0, lastComplete + 1);
      while (brackets > 0) { fixed += ']'; brackets--; }
      while (braces > 0) { fixed += '}'; braces--; }
      try {
        advice = JSON.parse(fixed);
      } catch {
        return res.status(500).json({ error: 'Response too long. Please try with fewer details.' });
      }
    }
    res.json({ success: true, advice });
  } catch (err) {
    console.error('[PersonalizedStyling] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── OUTFIT IMAGE GENERATION ───────────────────────────────────────────────────

app.post('/api/generate-outfit-image', requireAuth, async (req, res) => {
  const { outfitName, colors, description, occasion, gender } = req.body;
  try {
    const genderContext = gender?.toLowerCase().includes('male') || gender?.toLowerCase().includes('man')
      ? "men's fashion, male model or mannequin"
      : gender?.toLowerCase().includes('female') || gender?.toLowerCase().includes('woman')
      ? "women's fashion, female model or mannequin"
      : "fashion";

    const prompt = `Professional fashion product photography of ${outfitName} for ${genderContext}. ${description}. Colors: ${colors?.join(', ')}. Styled for ${occasion || 'casual wear'}. Clean white background, high quality studio shot, no text, clothing item on mannequin. Indian fashion style, detailed fabric texture visible.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Image generation failed');
    res.json({ success: true, imageUrl: data.data[0].url });
  } catch (err) {
    console.error('[ImageGen] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── HEALTH ────────────────────────────────────────────────────────────────────

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));