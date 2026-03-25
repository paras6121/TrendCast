const MYNTRA_CATEGORIES = {
  fashion: ['ethnic fusion', 'streetwear', 'oversized fits', 'co-ord sets', 'cargo pants'],
  color: ['terracotta', 'sage green', 'cobalt blue', 'off-white', 'burnt sienna'],
  fabric: ['linen blends', 'cotton jersey', 'denim', 'georgette', 'velvet'],
  occasion: ['festive wear', 'workwear', 'casual', 'party wear', 'athleisure'],
  mens: ['linen shirt', 'cargo pant', 'oversized tee', 'joggers', 'chino'],
  womens: ['co-ord set', 'wrap dress', 'crop top', 'palazzo', 'kurta set'],
};

const MYNTRA_BESTSELLERS = {
  fashion: ['linen co-ord set', 'oversized graphic tee', 'cargo joggers', 'wrap dress', 'shirt dress'],
  color: ['sage green kurta', 'terracotta ethnic set', 'off-white linen shirt', 'cobalt blue dress', 'cream co-ord'],
  fabric: ['pure linen kurta', 'cotton jersey dress', 'denim jacket', 'georgette saree', 'velvet blazer'],
  occasion: ['festive lehenga', 'work blazer set', 'casual dungaree', 'party sequin dress', 'athleisure set'],
  mens: ['linen shirt white', 'olive cargo pant', 'oversized drop shoulder tee', 'slim chino', 'printed jogger'],
  womens: ['floral wrap dress', 'ribbed co-ord set', 'embroidered kurta', 'wide leg palazzo', 'printed crop top'],
};

function hashKeyword(keyword) {
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) {
    hash = ((hash << 5) - hash) + keyword.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function simulateMyntra(keywords) {
  return keywords.map(keyword => {
    const lowerKw = keyword.toLowerCase();
    const hash = hashKeyword(lowerKw);

    let catKey = 'fashion';
    if (lowerKw.match(/colou?r|shade|tone/)) catKey = 'color';
    if (lowerKw.match(/fabric|material|cloth/)) catKey = 'fabric';
    if (lowerKw.match(/occasion|party|work|casual/)) catKey = 'occasion';
    if (lowerKw.match(/men|male|boy|gent/)) catKey = 'mens';
    if (lowerKw.match(/women|female|girl|lady/)) catKey = 'womens';

    const trending = MYNTRA_CATEGORIES[catKey];
    const bestsellers = MYNTRA_BESTSELLERS[catKey];

    const searchVolume = 50000 + (hash % 200000);
    const weeklyGrowth = 5 + (hash % 55);
    const lastWeekGrowth = 3 + ((hash * 7) % 40);
    const weeklyChange = weeklyGrowth - lastWeekGrowth;
    const bestsellerCount = 2 + (hash % 4);

    return {
      source: 'myntra_simulated',
      keyword,
      searchVolume,
      weeklyGrowth,
      weeklyChange,
      trendingStyles: trending,
      bestsellers: bestsellers.slice(0, bestsellerCount),
      bestsellerCount,
      demandSignal: weeklyChange > 20 ? 'HIGH' : weeklyChange > 5 ? 'MEDIUM' : 'LOW',
      weeklyNote: (weeklyChange > 0 ? '+' : '') + weeklyChange + '% vs last week, ' + bestsellerCount + ' bestsellers',
    };
  });
}