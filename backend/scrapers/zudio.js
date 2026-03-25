import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeZudio(keywords) {
  const results = [];
  for (const keyword of keywords) {
    try {
      const url = `https://www.zudio.com/search?q=${encodeURIComponent(keyword)}`;
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
      $('[class*="product-item"], [class*="ProductCard"]').slice(0, 10).each((_, card) => {
        const name = $(card).find('[class*="name"], [class*="title"], h3, h4').first().text().trim();
        const price = $(card).find('[class*="price"]').first().text().trim();
        if (name.length > 2) items.push({ name, price });
      });
      results.push({ source: 'zudio', keyword, totalResults: items.length, topItems: items.slice(0, 5) });
    } catch (err) {
      console.error('[Zudio] Error:', err.message);
      results.push({ source: 'zudio', keyword, totalResults: 0, topItems: [] });
    }
  }
  return results;
}
