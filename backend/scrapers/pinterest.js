import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapePinterest(keywords) {
  const results = [];
  for (const keyword of keywords) {
    try {
      const indianQuery = `${keyword} india fashion`;
      const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(indianQuery)}`;
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-IN,en;q=0.9',
        },
        timeout: 15000,
      });
      const $ = cheerio.load(data);
      const pinTexts = [];
      $('[data-test-id="pin"] img').each((_, el) => {
        const alt = $(el).attr('alt') || '';
        if (alt.length > 5) pinTexts.push(alt);
      });
      const wordFreq = {};
      pinTexts.join(' ').toLowerCase().split(/\W+/).forEach(word => {
        if (word.length > 4) wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
      const topWords = Object.entries(wordFreq).sort(([, a], [, b]) => b - a).slice(0, 8).map(([word]) => word);
      results.push({ source: 'pinterest', keyword, pinCount: pinTexts.length, trendingTerms: topWords });
    } catch (err) {
      console.error('[Pinterest] Error:', err.message);
      results.push({ source: 'pinterest', keyword, pinCount: 0, trendingTerms: [] });
    }
  }
  return results;
}
