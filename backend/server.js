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
import { predictTrends, expandCategory, analyzeCategoryIntelligence } from './claude.js';
import { generateTrendReport } from './PdfGenerator.js';
import { addToWatchlist, getWatchlist, removeFromWatchlist, updateWatchlistScore } from './watchlist.js';

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ 
  origin: FRONTEND_URL, 
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret_change_me',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// ── GOOGLE OAUTH STRATEGY ─────────────────────────────────────────────────────

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

passport.deserializeUser(async (id, done) => {
  try {
    const user = findUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ── GOOGLE AUTH ROUTES ────────────────────────────────────────────────────────

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}?error=google_failed` }),
  (req, res) => {
    const token = generateToken({ id: req.user.id, email: req.user.email, name: req.user.name, avatar: req.user.avatar });
    // Redirect to frontend with token in URL — frontend grabs it and stores in localStorage
res.redirect(`${FRONTEND_URL}?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&avatar=${encodeURIComponent(req.user.avatar || '')}`);  }
);

// ── EMAIL AUTH ROUTES ─────────────────────────────────────────────────────────

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

// ── PROTECTED ROUTES ──────────────────────────────────────────────────────────

function withTimeout(promise, ms, fallback) {
  return Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(fallback), ms))]);
}

app.post('/api/category-intelligence', requireAuth, async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: 'Provide a category' });
  try {
    const keywords = [category, category + ' trending', category + ' style', category + ' color', category + ' fit'];
    const kws = keywords.slice(0, 3);
    const emptyAmazon = kws.map(k => ({ source: 'amazon', keyword: k, totalResults: 0, topItems: [] }));
    const emptyReddit = kws.map(k => ({ source: 'reddit', keyword: k, totalPosts: 0, topTerms: [] }));
    const [amazonData, redditData] = await Promise.all([
      withTimeout(scrapeAmazon(kws), 20000, emptyAmazon),
      withTimeout(scrapeReddit(kws), 15000, emptyReddit),
    ]);
    const intelligence = await analyzeCategoryIntelligence(category, { amazonData, redditData, category });
    res.json({ success: true, intelligence });
  } catch (err) {
    console.error('[CategoryIntelligence] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

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

app.post('/api/predict', requireAuth, async (req, res) => {
  const { keywords } = req.body;
  if (!keywords || !Array.isArray(keywords) || keywords.length === 0)
    return res.status(400).json({ error: 'Provide an array of keywords' });
  const kws = keywords.slice(0, 5);
  try {
    const emptyGoogle   = kws.map(k => ({ source: 'google_trends', keyword: k, thisWeekScore: 0, lastWeekScore: 0, weeklyChange: 0, trend: 'UNKNOWN' }));
    const emptyAmazon   = kws.map(k => ({ source: 'amazon', keyword: k, totalResults: 0, newArrivalsThisWeek: 0, bestsellerCount: 0, topItems: [], demandSignal: 'LOW' }));
    const emptyYoutube  = kws.map(k => ({ source: 'youtube', keyword: k, videoCount: 0, avgViews: 0, trendSignal: 'EMERGING', topTerms: [] }));
    const emptyReddit   = kws.map(k => ({ source: 'reddit', keyword: k, totalPosts: 0, thisWeekPosts: 0, avgScore: 0, engagementSignal: 'LOW' }));
    const emptyShopping = kws.map(k => ({ source: 'google_shopping', keyword: k, totalProducts: 0, avgPrice: 0, demandSignal: 'LOW', topProducts: [] }));
    const emptyTwitter  = kws.map(k => ({ source: 'twitter', keyword: k, tweetCount: 0, avgEngagement: 0, viralSignal: 'EMERGING', topTerms: [] }));
    const [googleData, amazonData, youtubeData, redditData, googleShoppingData, twitterData] = await Promise.all([
      withTimeout(scrapeGoogleTrends(kws), 30000, emptyGoogle),
      withTimeout(scrapeAmazon(kws),       20000, emptyAmazon),
      withTimeout(scrapeYoutube(kws),      15000, emptyYoutube),
      withTimeout(scrapeReddit(kws),       15000, emptyReddit),
      withTimeout(scrapeGoogleShopping(kws), 20000, emptyShopping),
      withTimeout(scrapeTwitter(kws),      15000, emptyTwitter),
    ]);
    const myntraData = simulateMyntra(kws);
    const aggregated = aggregateData({ googleData, amazonData, youtubeData, redditData, myntraData, googleShoppingData, twitterData, keywords: kws });
    const predictions = await predictTrends(aggregated);
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
app.post('/api/style-advisor', requireAuth, async (req, res) => {
  const { skinTone, height, weight, faceShape, event, accessories, imageBase64 } = req.body;
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    let content = [];

    if (imageBase64) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 }
      });
    }

    const prompt = `You are a professional fashion stylist and color analyst specializing in Indian fashion and skin tones.

Analyze the following person's details and provide personalized styling advice:
${skinTone ? `- Skin tone: ${skinTone}` : ''}
${height ? `- Height: ${height}` : ''}
${weight ? `- Body type/weight: ${weight}` : ''}
${faceShape ? `- Face shape: ${faceShape}` : ''}
${event ? `- Occasion/Event: ${event}` : ''}
${accessories ? `- Accessories they have: ${accessories}` : ''}
${imageBase64 ? '- A photo has been provided, analyze their features from it.' : ''}

Respond ONLY with a valid JSON object in this exact format, no markdown, no extra text:
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
}`;

    content.push({ type: 'text', text: prompt });

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 8000,
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
app.post('/api/personalized-styling', requireAuth, async (req, res) => {
  const { gender, skinTone, height, weight, bodyType, faceShape, event, accessories, imageBase64 } = req.body;
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    let content = [];
    if (imageBase64) {
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } });
    }

    content.push({ type: 'text', text: `You are an expert Indian fashion stylist and color analyst. Analyze this person and give highly personalized styling advice considering upcoming Indian fashion trends for the next 3 months.

Person details:
- Gender: ${gender || 'Not specified'}
- Skin tone: ${skinTone || 'Not specified'}
- Height: ${height || 'Not specified'}
- Weight/Body: ${weight || 'Not specified'}
- Body type: ${bodyType || 'Not specified'}
- Face shape: ${faceShape || 'Not specified'}
- Occasion: ${event || 'General/Daily'}
- Accessories owned: ${accessories || 'None specified'}
${imageBase64 ? '- Photo provided: analyze visible features' : ''}

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "summary": "2-3 sentence personalized style summary for this specific person",
  "colorPalette": [
    { "name": "color name", "hex": "#hexcode", "reason": "why suits this person specifically", "trending": true/false, "season": "when to wear" }
  ],
  "avoidColors": [
    { "name": "color name", "hex": "#hexcode", "reason": "why to avoid for this body/skin" }
  ],
  "outfits": [
    { "name": "specific outfit name", "description": "detailed description", "colors": ["color1"], "occasion": "when", "buyAt": "Myntra/Amazon/Ajio", "tip": "styling tip", "trending": true/false }
  ],
  "futureTrends": [
    { "trend": "trend name", "relevance": "why relevant for this person", "when": "next 1-3 months", "howToWear": "specific advice" }
  ],
  "avoidStyles": [
    { "style": "style/cut to avoid", "reason": "specific reason for their body type" }
  ],
  "bodyTips": "detailed advice on cuts, silhouettes, fits for their specific body type and weight",
  "faceTips": "neckline and accessory advice for their face shape",
  "topOutfit": "single best outfit recommendation for their next event"
}` });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content }]
    });

  const raw = message.content[0].text.replace(/```json|```/g, '').trim();

// Try to fix truncated JSON by completing it
let advice;
try {
  advice = JSON.parse(raw);
} catch {
  // JSON was cut off — try to salvage it
  let fixed = raw;
  // Count unclosed braces and brackets
  let braces = 0, brackets = 0;
  for (const ch of fixed) {
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
  }
  // Remove trailing incomplete entry
  const lastComplete = fixed.lastIndexOf('},');
  if (lastComplete > 0) fixed = fixed.substring(0, lastComplete + 1);
  // Close all open brackets and braces
  while (brackets > 0) { fixed += ']'; brackets--; }
  while (braces > 0) { fixed += '}'; braces--; }
  try {
    advice = JSON.parse(fixed);
  } catch {
    // Last resort — ask Claude for shorter response
    return res.status(500).json({ error: 'Response too long. Please try with fewer details filled in.' });
  }
}
res.json({ success: true, advice });
  } catch (err) {
    console.error('[PersonalizedStyling] Error:', err);
    res.status(500).json({ error: err.message });
  }
});
app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));