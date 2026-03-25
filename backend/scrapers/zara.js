import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeZara(keywords) {
  const results = [];
  for (const keyword of keywords) {
    try {
      const url = `https://www.zara.com/in/en/search?searchTerm=${encodeURIComponent(keyword)}`;
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-IN,en;q=0.9',
        },
        timeout: 10000,
      });
      const $ = cheerio.load(data);
      const items = [];
      $('[class*="product-grid-product"]').slice(0, 8).each((_, card) => {
        const name = $(card).find('[class*="product-grid-product-info__name"]').first().text().trim();
        const price = $(card).find('[class*="price"]').first().text().trim();
        if (name.length > 2) items.push({ name, price });
      });
      results.push({ source: 'zara', keyword, totalResults: items.length, topItems: items.slice(0, 5) });
    } catch (err) {
      console.error('[Zara] Error:', err.message);
      results.push({ source: 'zara', keyword, totalResults: 0, topItems: [] });
    }
  }
  return results;
}