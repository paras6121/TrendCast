import { scrapeGoogleTrends } from './scrapers/googleTrends.js';
import { scrapeAmazon } from './scrapers/amazon.js';
import { scrapeYoutube } from './scrapers/youtube.js';
import { scrapeReddit } from './scrapers/reddit.js';

const keywords = ['cargo pants'];

console.log('Testing Google Trends...');
const google = await scrapeGoogleTrends(keywords);
console.log('Google result:', JSON.stringify(google, null, 2));

console.log('Testing Amazon...');
const amazon = await scrapeAmazon(keywords);
console.log('Amazon result:', JSON.stringify(amazon, null, 2));

console.log('Testing YouTube...');
const youtube = await scrapeYoutube(keywords);
console.log('YouTube result:', JSON.stringify(youtube, null, 2));

console.log('Testing Reddit...');
const reddit = await scrapeReddit(keywords);
console.log('Reddit result:', JSON.stringify(reddit, null, 2));
```

Then in terminal run:
```
node test.js