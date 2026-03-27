const SOURCE_WEIGHTS = {
  google_trends: 0.25,
  amazon: 0.30,
  google_shopping: 0.07,
  twitter: 0.03,
  youtube: 0.10,
  reddit: 0.10,
  myntra: 0.15,
};

export function aggregateData({ googleData, amazonData, youtubeData, redditData, myntraData, googleShoppingData, twitterData, keywords, sourceWeights }) {
  const weights = sourceWeights || SOURCE_WEIGHTS;
  const summary = [];

  for (const keyword of keywords) {
    const google = googleData.find(d => d.keyword === keyword) || {};
    const amazon = amazonData.find(d => d.keyword === keyword) || {};
    const youtube = youtubeData.find(d => d.keyword === keyword) || {};
    const reddit = redditData.find(d => d.keyword === keyword) || {};
    const myntra = myntraData.find(d => d.keyword === keyword) || {};
    const shopping = googleShoppingData.find(d => d.keyword === keyword) || {};
    const twitter = twitterData.find(d => d.keyword === keyword) || {};

    const googleScore = Math.min(100, (google.thisWeekScore || 0) + Math.max(0, (google.weeklyChange || 0) * 0.5));
    const amazonScore = Math.min(100, ((amazon.totalResults || 0) * 5) + ((amazon.bestsellerCount || 0) * 15) + ((amazon.newArrivalsThisWeek || 0) * 3));
    const youtubeScore = Math.min(100, ((youtube.avgViews || 0) / 10000) + ((youtube.thisWeekVideos || 0) * 5));
    const redditScore = Math.min(100, ((reddit.thisWeekPosts || 0) * 10) + ((reddit.avgScore || 0) * 0.5));
    const myntraScore = Math.min(100, ((myntra.weeklyGrowth || 0) * 1.5) + ((myntra.bestsellerCount || 0) * 10));
    const shoppingScore = Math.min(100, (shopping.totalProducts || 0) * 8);
    const twitterScore = Math.min(100, ((twitter.tweetCount || 0) * 5) + ((twitter.avgEngagement || 0) * 0.1));

    const compositeScore =
      googleScore * weights.google_trends +
      amazonScore * weights.amazon +
      shoppingScore * weights.google_shopping +
      twitterScore * weights.twitter +
      youtubeScore * weights.youtube +
      redditScore * weights.reddit +
      myntraScore * weights.myntra;

    summary.push({
      keyword,
      compositeScore: Math.round(compositeScore),
      signals: {
        googleTrends: {
          thisWeekScore: google.thisWeekScore,
          lastWeekScore: google.lastWeekScore,
          weeklyChange: google.weeklyChange,
          trend: google.trend,
        },
        amazon: {
          totalResults: amazon.totalResults,
          newArrivalsThisWeek: amazon.newArrivalsThisWeek,
          bestsellerCount: amazon.bestsellerCount,
          demandSignal: amazon.demandSignal,
          topItems: amazon.topItems,
          weeklyNote: amazon.weeklyNote,
        },
        googleShopping: {
          totalProducts: shopping.totalProducts,
          avgPrice: shopping.avgPrice,
          demandSignal: shopping.demandSignal,
          weeklyNote: shopping.weeklyNote,
        },
        twitter: {
          tweetCount: twitter.tweetCount,
          avgEngagement: twitter.avgEngagement,
          viralSignal: twitter.viralSignal,
          topTerms: twitter.topTerms,
          weeklyNote: twitter.weeklyNote,
        },
        youtube: {
          videoCount: youtube.videoCount,
          thisWeekVideos: youtube.thisWeekVideos,
          avgViews: youtube.avgViews,
          trendSignal: youtube.trendSignal,
          topTerms: youtube.topTerms,
          weeklyNote: youtube.weeklyNote,
        },
        reddit: {
          totalPosts: reddit.totalPosts,
          thisWeekPosts: reddit.thisWeekPosts,
          avgScore: reddit.avgScore,
          engagementSignal: reddit.engagementSignal,
          topTerms: reddit.topTerms,
          weeklyNote: reddit.weeklyNote,
        },
        myntra: {
          searchVolume: myntra.searchVolume,
          weeklyGrowth: myntra.weeklyGrowth,
          weeklyChange: myntra.weeklyChange,
          bestsellers: myntra.bestsellers,
          bestsellerCount: myntra.bestsellerCount,
          weeklyNote: myntra.weeklyNote,
        },
      },
    });
  }

  return summary;
}
