import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const adapter = new JSONFile(join(__dirname, 'watchlist.json'));
const db = new Low(adapter, { items: [] });

await db.read();

export async function addToWatchlist(keyword, email) {
  await db.read();
  const existing = db.data.items.find(i => i.keyword.toLowerCase() === keyword.toLowerCase() && i.email === email);
  if (existing) return { already: true };
  db.data.items.push({
    id: Date.now().toString(),
    keyword,
    email: email || 'default',
    addedAt: new Date().toISOString(),
    lastScore: null,
    lastChecked: null,
    history: [],
  });
  await db.write();
  return { added: true };
}

export async function getWatchlist(email) {
  await db.read();
  return db.data.items.filter(i => i.email === (email || 'default'));
}

export async function removeFromWatchlist(id) {
  await db.read();
  db.data.items = db.data.items.filter(i => i.id !== id);
  await db.write();
  return { removed: true };
}

export async function updateWatchlistScore(keyword, score, trend) {
  await db.read();
  const items = db.data.items.filter(i => i.keyword.toLowerCase() === keyword.toLowerCase());
  items.forEach(item => {
    item.history = item.history || [];
    item.history.push({
      date: new Date().toISOString(),
      score,
      trend,
    });
    if (item.history.length > 12) item.history = item.history.slice(-12);
    item.lastScore = score;
    item.lastTrend = trend;
    item.lastChecked = new Date().toISOString();
  });
  await db.write();
}

export async function getAllWatchlistKeywords() {
  await db.read();
  return [...new Set(db.data.items.map(i => i.keyword))];
}