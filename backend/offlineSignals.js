import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const adapter = new JSONFile(join(__dirname, 'offlineSignals.json'));
const db = new Low(adapter, { signals: [] });

await db.read();

export async function addOfflineSignal({ keyword, source, sourceType, insight, confidence, leadWeeks, addedBy }) {
  await db.read();
  const id = Date.now().toString();
  db.data.signals.push({
    id,
    keyword: keyword.toLowerCase().trim(),
    source,
    sourceType,
    insight,
    confidence: confidence || 'HIGH',
    leadWeeks: leadWeeks || 12,
    addedBy: addedBy || 'Analyst',
    addedAt: new Date().toISOString(),
    active: true,
  });
  await db.write();
  return { id, saved: true };
}

export async function getOfflineSignals(keyword) {
  await db.read();
  const cleaned = keyword?.toLowerCase().trim();
  if (!cleaned) return db.data.signals.filter(s => s.active);
  return db.data.signals.filter(s =>
    s.active && (
      s.keyword === cleaned ||
      s.keyword.includes(cleaned) ||
      cleaned.includes(s.keyword) ||
      cleaned.split(' ').some(w => w.length > 3 && s.keyword.includes(w))
    )
  );
}

export async function getAllOfflineSignals() {
  await db.read();
  return db.data.signals.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
}

export async function deactivateSignal(id) {
  await db.read();
  const s = db.data.signals.find(s => s.id === id);
  if (s) s.active = false;
  await db.write();
  return { deactivated: true };
}

export async function getSignalsForKeywords(keywords) {
  await db.read();
  const results = {};
  for (const kw of keywords) {
    const cleaned = kw.toLowerCase().trim();
    const matches = db.data.signals.filter(s =>
      s.active && (
        s.keyword === cleaned ||
        s.keyword.includes(cleaned) ||
        cleaned.includes(s.keyword) ||
        cleaned.split(' ').some(w => w.length > 3 && s.keyword.includes(w))
      )
    );
    if (matches.length > 0) results[kw] = matches;
  }
  return results;
}
