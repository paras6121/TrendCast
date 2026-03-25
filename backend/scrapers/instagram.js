import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeInstagram(keywords) {
  const results = [];
  for (const keyword of keywords) {
    try {
      const hashtag = keyword.replace(/\s+/g, '').toLowerCase();
      const url = `https://www.instagram.com/explore/tags/${encodeURIComponent(hashtag + 'india')}/`;
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-IN,en;q=0.9',
        },
        timeout: 10000,
      });
      const $ = cheerio.load(data);
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      const postCountMatch = metaDescription.match(/([\d,]+)\s*posts/i);
      const postCount = postCountMatch ? parseInt(postCountMatch[1].replace(/,/g, '')) : 0;
      results.push({
        source: 'instagram',
        keyword,
        postCount,
        engagementSignal: postCount > 100000 ? 'HIGH' : postCount > 10000 ? 'MEDIUM' : 'LOW',
        weeklyNote: postCount + ' posts on #' + hashtag + 'india',
      });
    } catch (err) {
      console.error('[Instagram] Error:', err.message);
      results.push({ source: 'instagram', keyword, postCount: 0, engagementSignal: 'LOW', weeklyNote: 'no data' });
    }
  }
  return results;
}
