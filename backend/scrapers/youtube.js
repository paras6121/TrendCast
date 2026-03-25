import axios from 'axios';

export async function scrapeYoutube(keywords) {
  const results = [];
  for (const keyword of keywords) {
    try {
      const searchQuery = keyword + ' fashion trend India 2025';
      const { data } = await axios.get('https://www.youtube.com/results?search_query=' + encodeURIComponent(searchQuery) + '&sp=CAISBAgCEAE%3D', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-IN,en;q=0.9',
        },
        timeout: 12000,
      });

      const videoMatches = data.match(/"title":\{"runs":\[\{"text":"([^"]+)"/g) || [];
      const viewMatches = data.match(/"viewCountText":\{"simpleText":"([^"]+)"/g) || [];
      const dateMatches = data.match(/"publishedTimeText":\{"simpleText":"([^"]+)"/g) || [];

      const titles = videoMatches.slice(0, 10).map(m => m.match(/"text":"([^"]+)"/)?.[1] || '').filter(t => t.length > 3);
      const views = viewMatches.slice(0, 10).map(m => parseInt((m.match(/"simpleText":"([^"]+)"/)?.[1] || '0').replace(/[^0-9]/g, '')) || 0);
      const dates = dateMatches.slice(0, 10).map(m => m.match(/"simpleText":"([^"]+)"/)?.[1] || '');

      const thisWeekVideos = dates.filter(d => d.includes('day') || d.includes('hour')).length;
      const totalViews = views.reduce((a, b) => a + b, 0);
      const avgViews = views.length ? Math.round(totalViews / views.length) : 0;

      const wordFreq = {};
      titles.join(' ').toLowerCase().split(/\W+/).forEach(word => {
        if (word.length > 4 && !['fashion', 'trend', 'style', 'india', 'video', 'hindi', 'outfit', 'looks'].includes(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
      const topTerms = Object.entries(wordFreq).sort(([, a], [, b]) => b - a).slice(0, 6).map(([w]) => w);

      results.push({
        source: 'youtube',
        keyword,
        videoCount: titles.length,
        thisWeekVideos,
        avgViews,
        totalViews,
        topTitles: titles.slice(0, 3),
        topTerms,
        trendSignal: avgViews > 500000 ? 'VIRAL' : avgViews > 100000 ? 'TRENDING' : avgViews > 10000 ? 'GROWING' : 'EMERGING',
        weeklyNote: thisWeekVideos + ' new videos this week, avg ' + avgViews.toLocaleString() + ' views',
      });
    } catch (err) {
      console.error('[YouTube] Error:', err.message);
      results.push({ source: 'youtube', keyword, videoCount: 0, thisWeekVideos: 0, avgViews: 0, totalViews: 0, topTitles: [], topTerms: [], trendSignal: 'EMERGING', weeklyNote: 'no data' });
    }
  }
  return results;
}