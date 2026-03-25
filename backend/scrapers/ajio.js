import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeAjio(keywords) {
  const results = [];
  for (const keyword of keywords) {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/html',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Referer': 'https://www.ajio.com/',
      };

      const [currentRes, newRes, bestsellerRes] = await Promise.all([
        axios.get(`https://www.ajio.com/api/search?text=${encodeURIComponent(keyword)}&pageSize=10&currentPage=0&sortBy=relevance`, { headers, timeout: 10000 }),
        axios.get(`https://www.ajio.com/api/search?text=${encodeURIComponent(keyword)}&pageSize=10&currentPage=0&sortBy=newArrivals`, { headers, timeout: 10000 }),
        axios.get(`https://www.ajio.com/api/search?text=${encodeURIComponent(keyword)}&pageSize=10&currentPage=0&sortBy=topRated`, { headers, timeout: 10000 }),
      ]);

      const parseProducts = (data) => {
        const products = data?.products || data?.searchresult?.products || [];
        return products.slice(0, 8).map(p => ({
          name: p.name || p.title || '',
          price: p.price?.formattedValue || '',
          brand: p.brandname || '',
          rating: p.averageRating || 0,
        })).filter(i => i.name.length > 2);
      };

      const currentItems = parseProducts(currentRes.data);
      const newItems = parseProducts(newRes.data);
      const bestsellerItems = parseProducts(bestsellerRes.data);

      results.push({
        source: 'ajio',
        keyword,
        totalResults: currentItems.length,
        newArrivalsThisWeek: newItems.length,
        bestsellerCount: bestsellerItems.length,
        bestsellerItems: bestsellerItems.slice(0, 5),
        demandSignal: bestsellerItems.length >= 5 ? 'HIGH' : newItems.length >= 3 ? 'MEDIUM' : 'LOW',
        topItems: currentItems.slice(0, 5),
        weeklyNote: `${newItems.length} new arrivals, ${bestsellerItems.length} top rated`,
      });
    } catch (err) {
      console.error('[Ajio] Error:', err.message);
      results.push({ source: 'ajio', keyword, totalResults: 0, newArrivalsThisWeek: 0, bestsellerCount: 0, bestsellerItems: [], demandSignal: 'LOW', topItems: [], weeklyNote: 'no data' });
    }
  }
  return results;
}