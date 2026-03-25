import axios from 'axios';

export async function scrapeTwitter(keywords) {
  const results = [];
  for (const keyword of keywords) {
    try {
      console.log('[Social] Searching for: ' + keyword);

      const [mastodonRes, blueskyRes] = await Promise.all([
        axios.get('https://mastodon.social/api/v2/search?q=' + encodeURIComponent(keyword + ' fashion india') + '&type=statuses&limit=20', {
          headers: { 'User-Agent': 'TrendPredictor/1.0' },
          timeout: 10000,
        }).catch(() => null),

        axios.get('https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=' + encodeURIComponent(keyword + ' fashion india') + '&limit=20', {
          headers: { 'User-Agent': 'TrendPredictor/1.0' },
          timeout: 10000,
        }).catch(() => null),
      ]);

      const mastodonPosts = mastodonRes?.data?.statuses || [];
      const blueskyPosts = blueskyRes?.data?.posts || [];

      const mastodonCount = mastodonPosts.length;
      const blueskyCount = blueskyPosts.length;
      const totalPosts = mastodonCount + blueskyCount;

      const mastodonEngagement = mastodonPosts.reduce((a, p) =>
        a + (p.reblogs_count || 0) + (p.favourites_count || 0), 0);
      const avgEngagement = totalPosts > 0
        ? Math.round(mastodonEngagement / Math.max(mastodonCount, 1))
        : 0;

      const allText = [
        ...mastodonPosts.map(p => p.content?.replace(/<[^>]*>/g, '') || ''),
        ...blueskyPosts.map(p => p.record?.text || ''),
      ].join(' ');

      const wordFreq = {};
      allText.toLowerCase().split(/\W+/).forEach(word => {
        if (word.length > 4 && !['fashion', 'style', 'india', 'outfit', 'https', 'wearing', 'today', 'should', 'would'].includes(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
      const topTerms = Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([w]) => w);

      const viralSignal = totalPosts > 15 ? 'TRENDING'
        : totalPosts > 8 ? 'GROWING'
        : 'EMERGING';

      console.log('[Social] ' + keyword + ': mastodon=' + mastodonCount + ' bluesky=' + blueskyCount + ' signal=' + viralSignal);

      results.push({
        source: 'twitter',
        keyword,
        tweetCount: totalPosts,
        mastodonCount,
        blueskyCount,
        avgEngagement,
        viralSignal,
        topTerms,
        weeklyNote: totalPosts + ' social posts found (Mastodon + Bluesky)',
      });
    } catch (err) {
      console.error('[Social] Error:', err.message);
      results.push({
        source: 'twitter',
        keyword,
        tweetCount: 0,
        avgEngagement: 0,
        viralSignal: 'EMERGING',
        topTerms: [],
        weeklyNote: 'no data',
      });
    }
  }
  return results;
}
