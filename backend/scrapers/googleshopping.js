import axios from 'axios';
import * as cheerio from 'cheerio';
import { getCached, setCached } from '../cache.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function scrapeGoogleShopping(keywords) {
  const results = [];

  for (const keyword of keywords) {
    const cacheKey = 'gshopping_' + keyword.toLowerCase().trim();
    const cached = getCached(cacheKey);
    if (cached && cached.totalProducts > 0) {
      console.log('[GoogleShopping] Cache hit for: ' + keyword);
      results.push(cached);
      continue;
    }

    try {
      await delay(1000);
      console.log('[GoogleShopping] Searching: ' + keyword);

      const { data } = await axios.get('https://www.amazon.in/s', {
        params: {
          k: keyword,
          i: 'fashion',
          rh: 'n:1571271031',
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-IN,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        timeout: 12000,
      });

      const $ = cheerio.load(data);
      const products = [];

      $('[data-component-type="s-search-result"]').slice(0, 15).each((_, card) => {
        const name = $(card).find('h2 span').first().text().trim();
        const priceWhole = $(card).find('.a-price-whole').first().text().trim();
        const priceFraction = $(card).find('.a-price-fraction').first().text().trim();
        const price = priceWhole ? '₹' + priceWhole + (priceFraction || '') : '';
        const rating = $(card).find('.a-icon-alt').first().text().trim();
        const reviews = $(card).find('.a-size-base.s-underline-text').first().text().trim();
        if (name.length > 2) products.push({ name, price, rating, reviews });
      });

      const prices = products
        .map(p => parseInt((p.price || '').replace(/[^0-9]/g, '')))
        .filter(p => p > 100 && p < 100000);

      const avgPrice = prices.length
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0;

      const demandSignal = products.length >= 8 ? 'HIGH'
        : products.length >= 4 ? 'MEDIUM' : 'LOW';

      console.log('[GoogleShopping] ' + keyword + ': ' + products.length + ' fashion products, avg Rs.' + avgPrice);

      const result = {
        source: 'google_shopping',
        keyword,
        totalProducts: products.length,
        avgPrice,
        demandSignal,
        topProducts: products.slice(0, 5),
        weeklyNote: products.length + ' fashion products, avg Rs.' + avgPrice,
      };

      if (products.length > 0) setCached(cacheKey, result);
      results.push(result);

    } catch (err) {
      console.error('[GoogleShopping] Error:', err.message);
      results.push({
        source: 'google_shopping',
        keyword,
        totalProducts: 0,
        avgPrice: 0,
        demandSignal: 'LOW',
        topProducts: [],
        weeklyNote: 'no data',
      });
    }
  }

  return results;
}