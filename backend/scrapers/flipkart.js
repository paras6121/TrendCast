import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeFlipkart(keywords) {
  const results = [];
  for (const keyword of keywords) {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      };
      const [currentRes, popularRes] = await Promise.all([
        axios.get(`https://www.flipkart.com/search?q=${encodeURIComponent(keyword)}&sort=relevance`, { headers, timeout: 10000 }),
        axios.get(`https://www.flipkart.com/search?q=${encodeURIComponent(keyword)}&sort=popularity`, { headers, timeout: 10000 }),
      ]);
      const parseItems = (data) => {
        const $ = cheerio.load(data);
        const items = [];
        $('[data-id]').slice(0, 8).each((_, card) => {
          const name = $(card).find('[class*="KzDlHZ"], [class*="_4rR01T"]').first().text().trim();
          const price = $(card).find('[class*="Nx9bqj"], [class*="_30jeq3"]').first().text().trim();
          const badge = $(card).find('[class*="yiggsN"], [class*="_3xFhiH"]').first().text().trim();
          if (name.length > 2) items.push({ name, price, badge });
        });
        return items;
      };
      const currentItems = parseItems(currentRes.data);
      const popularItems = parseItems(popularRes.data);
      const bestsellerCount = popularItems.filter(i => i.badge?.toLowerCase().includes('best') || i.badge?.toLowerCase().includes('trending')).length;
      results.push({
        source: 'flipkart',
        keyword,
        totalResults: currentItems.length,
        newArrivalsThisWeek: currentItems.length,
        bestsellerCount,
        bestsellerItems: popularItems.slice(0, 5),
        demandSignal: bestsellerCount >= 3 ? 'HIGH' : currentItems.length >= 5 ? 'MEDIUM' : 'LOW',
        topItems: currentItems.slice(0, 5),
        weeklyNote: currentItems.length + ' results, ' + bestsellerCount + ' trending items',
      });
    } catch (err) {
      console.error('[Flipkart] Error:', err.message);
      results.push({ source: 'flipkart', keyword, totalResults: 0, newArrivalsThisWeek: 0, bestsellerCount: 0, bestsellerItems: [], demandSignal: 'LOW', topItems: [], weeklyNote: 'no data' });
    }
  }
  return results;
}