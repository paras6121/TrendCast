import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeHM(keywords) {
  const results = [];
  for (const keyword of keywords) {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'sec-ch-ua-mobile': '?0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      };
      const [currentRes, newRes, bestsellerRes] = await Promise.all([
        axios.get('https://www2.hm.com/en_in/search-results.html?q=' + encodeURIComponent(keyword) + '&sort=stock', { headers, timeout: 10000 }),
        axios.get('https://www2.hm.com/en_in/search-results.html?q=' + encodeURIComponent(keyword) + '&sort=newProduct', { headers, timeout: 10000 }),
        axios.get('https://www2.hm.com/en_in/search-results.html?q=' + encodeURIComponent(keyword) + '&sort=topSellers', { headers, timeout: 10000 }),
      ]);
      const parseItems = (data) => {
        const $ = cheerio.load(data);
        const items = [];
        $('.product-item').slice(0, 8).each((_, card) => {
          const name = $(card).find('.item-heading').first().text().trim();
          const price = $(card).find('.price').first().text().trim();
          const badge = $(card).find('.badge-text').first().text().trim();
          if (name.length > 2) items.push({ name, price, badge });
        });
        return items;
      };
      const currentItems = parseItems(currentRes.data);
      const newItems = parseItems(newRes.data);
      const bestsellerItems = parseItems(bestsellerRes.data);
      const newArrivals = newItems.filter(i => i.badge?.toLowerCase().includes('new')).length;
      results.push({
        source: 'hm',
        keyword,
        totalResults: currentItems.length,
        newArrivals,
        newArrivalsThisWeek: newItems.length,
        bestsellerCount: bestsellerItems.length,
        bestsellerItems: bestsellerItems.slice(0, 5),
        demandSignal: bestsellerItems.length >= 4 ? 'HIGH' : newArrivals >= 2 ? 'MEDIUM' : 'LOW',
        topItems: currentItems.slice(0, 5),
        weeklyNote: newArrivals + ' new arrivals, ' + bestsellerItems.length + ' top sellers',
      });
    } catch (err) {
      console.error('[HM] Error:', err.message);
      results.push({ source: 'hm', keyword, totalResults: 0, newArrivals: 0, newArrivalsThisWeek: 0, bestsellerCount: 0, bestsellerItems: [], demandSignal: 'LOW', topItems: [], weeklyNote: 'no data' });
    }
  }
  return results;
}