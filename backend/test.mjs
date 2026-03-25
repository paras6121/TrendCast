import 'dotenv/config';
import { scrapeGoogleTrends } from './scrapers/googleTrends.js';

const r = await scrapeGoogleTrends(['cargo pants']);
console.log(JSON.stringify(r, null, 2));

