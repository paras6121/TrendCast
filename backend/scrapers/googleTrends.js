import axios from 'axios';
import { getCached, setCached } from '../cache.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getGoogleTrendsData(keyword) {
  const session = axios.create({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-IN,en;q=0.9',
      'Referer': 'https://trends.google.com/',
    },
  });

  const exploreRes = await session.get('https://trends.google.com/trends/api/explore', {
    params: {
      hl: 'en-IN',
      tz: -330,
      req: JSON.stringify({
        comparisonItem: [{ keyword, geo: 'IN', time: 'today 3-m' }],
        category: 0,
        property: '',
      }),
    },
    timeout: 15000,
  });

  const exploreText = exploreRes.data.replace(")]}',\n", '').trim();
  const exploreJson = JSON.parse(exploreText);
  const widgets = exploreJson.widgets || [];
  const timeWidget = widgets.find(w => w.id === 'TIMESERIES');

  if (!timeWidget) throw new Error('No timeseries widget found');

  await delay(500);

  const dataRes = await session.get('https://trends.google.com/trends/api/widgetdata/multiline', {
    params: {
      hl: 'en-IN',
      tz: -330,
      req: JSON.stringify(timeWidget.request),
      token: timeWidget.token,
      geo: 'IN',
    },
    timeout: 15000,
  });

  const dataText = dataRes.data.replace(")]}',\n", '').trim();
  const dataJson = JSON.parse(dataText);
  const timeline = dataJson?.default?.timelineData || [];
  return timeline.map(t => t.value?.[0] || 0);
}

export async function scrapeGoogleTrends(keywords) {
  const results = [];

  for (const keyword of keywords) {
    const cleaned = keyword.toLowerCase().trim();
    const cacheKey = 'gtrends_' + cleaned;
    const cached = getCached(cacheKey);
    if (cached && cached.overallScore > 0) {
      console.log('[GoogleTrends] Cache hit for: ' + cleaned);
      results.push(cached);
      continue;
    }

    try {
      await delay(8000);
      console.log('[GoogleTrends] Fetching: ' + cleaned);

      const values = await getGoogleTrendsData(cleaned);

      if (!values || values.length === 0) {
        console.log('[GoogleTrends] No data for: ' + cleaned);
        results.push({ source: 'google_trends', keyword, thisWeekScore: 0, lastWeekScore: 0, overallScore: 0, weeklyChange: 0, trend: 'UNKNOWN' });
        continue;
      }

      const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
      const recentAvg = avg(values.slice(-4));
      const olderAvg = avg(values.slice(-8, -4));
      const overallScore = avg(values);

      const weeklyChange = olderAvg > 0
        ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
        : 0;

      const trend = weeklyChange > 20 ? 'RAPIDLY_RISING'
        : weeklyChange > 5 ? 'RISING'
        : weeklyChange < -20 ? 'RAPIDLY_FALLING'
        : weeklyChange < -5 ? 'FALLING'
        : 'STABLE';

      console.log('[GoogleTrends] ' + cleaned + ': score=' + overallScore + ' recent=' + recentAvg + ' change=' + weeklyChange + '% trend=' + trend + ' dataPoints=' + values.length);

      const result = {
        source: 'google_trends',
        keyword,
        thisWeekScore: recentAvg,
        lastWeekScore: olderAvg,
        overallScore,
        weeklyChange,
        trend,
      };

      if (overallScore > 0) setCached(cacheKey, result);
      results.push(result);

    } catch (err) {
      console.error('[GoogleTrends] Error for ' + keyword + ':', err.message);
      results.push({ source: 'google_trends', keyword, thisWeekScore: 0, lastWeekScore: 0, overallScore: 0, weeklyChange: 0, trend: 'UNKNOWN' });
    }
  }

  return results;
}