import axios from 'axios';

export async function scrapeReddit(keywords) {
  const results = [];
  for (const keyword of keywords) {
    try {
      console.log('[Reddit] Starting search for: ' + keyword);

      const url = 'https://www.reddit.com/search.json?q=' + encodeURIComponent(keyword + ' fashion india') + '&sort=new&limit=25&t=week';

      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 12000,
      });

      const posts = (data?.data?.children || []).map(p => ({
        title: p.data.title || '',
        score: p.data.score || 0,
        comments: p.data.num_comments || 0,
        subreddit: p.data.subreddit || '',
        created: p.data.created_utc || 0,
      }));

      console.log('[Reddit] Found ' + posts.length + ' posts for: ' + keyword);

      const oneWeekAgo = Date.now() / 1000 - 7 * 24 * 60 * 60;
      const thisWeekPosts = posts.filter(p => p.created > oneWeekAgo);
      const avgScore = posts.length
        ? Math.round(posts.reduce((a, b) => a + b.score, 0) / posts.length)
        : 0;

      const wordFreq = {};
      posts.map(p => p.title).join(' ').toLowerCase().split(/\W+/).forEach(word => {
        if (word.length > 4 && !['fashion', 'style', 'india', 'indian', 'clothes', 'outfit', 'which', 'where', 'should', 'would', 'could', 'their', 'https', 'reddit'].includes(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
      const topTerms = Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([w]) => w);

      results.push({
        source: 'reddit',
        keyword,
        totalPosts: posts.length,
        thisWeekPosts: thisWeekPosts.length,
        avgScore,
        totalComments: posts.reduce((a, b) => a + b.comments, 0),
        topTerms,
        engagementSignal: avgScore > 100 ? 'HIGH' : avgScore > 20 ? 'MEDIUM' : 'LOW',
        weeklyNote: thisWeekPosts.length + ' posts this week, avg score ' + avgScore,
      });
    } catch (err) {
      console.error('[Reddit] Error for ' + keyword + ':', err.message);
      results.push({
        source: 'reddit',
        keyword,
        totalPosts: 0,
        thisWeekPosts: 0,
        avgScore: 0,
        totalComments: 0,
        topTerms: [],
        engagementSignal: 'LOW',
        weeklyNote: 'no data',
      });
    }
  }
  return results;
}