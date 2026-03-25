import axios from 'axios';
import * as cheerio from 'cheerio';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function scrapeAmazon(keywords) {
  const results = [];
  for (const keyword of keywords) {
    try {
      await delay(500);
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      };

      const [relevanceRes, newRes, bestsellerRes] = await Promise.all([
        axios.get('https://www.amazon.in/s?k=' + encodeURIComponent(keyword) + '&sort=relevanceblender', { headers, timeout: 12000 }),
        axios.get('https://www.amazon.in/s?k=' + encodeURIComponent(keyword) + '&sort=date-desc-rank', { headers, timeout: 12000 }),
        axios.get('https://www.amazon.in/s?k=' + encodeURIComponent(keyword) + '&sort=exact-aware-popularity-rank', { headers, timeout: 12000 }),
      ]);

      const parseItems = (html) => {
        const $ = cheerio.load(html);
        const items = [];
        $('[data-component-type="s-search-result"]').slice(0, 10).each((_, card) => {
          const name = $(card).find('h2 span').first().text().trim();
          const price = $(card).find('.a-price-whole').first().text().trim();
          const rating = $(card).find('.a-icon-alt').first().text().trim();
          const badge = $(card).find('.a-badge-text').first().text().trim();
          const reviews = $(card).find('.a-size-base.s-underline-text').first().text().trim();
          if (name.length > 2) items.push({ name, price, rating, badge, reviews });
        });
        return items;
      };

      const relevanceItems = parseItems(relevanceRes.data);
      const newItems = parseItems(newRes.data);
      const bestsellerItems = parseItems(bestsellerRes.data);

      const bestsellerCount = bestsellerItems.filter(i =>
        i.badge?.toLowerCase().includes('best') ||
        i.badge?.toLowerCase().includes('#1') ||
        i.badge?.toLowerCase().includes('top')
      ).length;

      const avgRating = relevanceItems
        .map(i => parseFloat(i.rating))
        .filter(r => !isNaN(r))
        .reduce((sum, r, _, arr) => sum + r / arr.length, 0);

      results.push({
        source: 'amazon',
        keyword,
        totalResults: relevanceItems.length,
        newArrivalsThisWeek: newItems.length,
        bestsellerCount,
        avgRating: Math.round(avgRating * 10) / 10,
        topItems: relevanceItems.slice(0, 5),
        bestsellerItems: bestsellerItems.slice(0, 5),
        demandSignal: bestsellerCount >= 3 ? 'HIGH' : newItems.length >= 5 ? 'MEDIUM' : 'LOW',
        weeklyNote: newItems.length + ' new this week, ' + bestsellerCount + ' bestsellers',
      });
    } catch (err) {
      console.error('[Amazon] Error:', err.message);
      results.push({ source: 'amazon', keyword, totalResults: 0, newArrivalsThisWeek: 0, bestsellerCount: 0, avgRating: 0, topItems: [], bestsellerItems: [], demandSignal: 'LOW', weeklyNote: 'no data' });
    }
  }
  return results;
}