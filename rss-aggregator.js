const http = require('http');
const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const PORT = process.env.PORT || 8080;
const rssParser = new Parser({
  timeout: 4000,
  headers: {
    'User-Agent': 'PulseWire News Aggregator',
  },
  customFields: {
    item: ['media:content', 'enclosure'],
  },
});

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const FEEDS = [
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News', category: 'general', lang: 'en' },
  { url: 'https://www.tagesschau.de/xml/rss2/', source: 'tagesschau.de', category: 'general', lang: 'de' },
  { url: 'https://www.spiegel.de/schlagzeilen/index.rss', source: 'SPIEGEL', category: 'general', lang: 'de' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian', category: 'general', lang: 'en' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'The New York Times', category: 'general', lang: 'en' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Technology', category: 'technology', lang: 'en' },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business', category: 'business', lang: 'en' },
];

function inferCategory(text, defaultCategory) {
  const lower = (text || '').toLowerCase();
  const map = {
    business: ['business', 'wirtschaft', 'börse', 'finanzen', 'unternehmen', 'aktie', 'markt', 'konjunktur', 'trade', 'economy', 'inflation'],
    entertainment: ['entertainment', 'film', 'kino', 'musik', 'promi', 'show', 'kultur', 'festival', 'celebrity', 'arts'],
    health: ['health', 'gesundheit', 'medizin', 'krankenhaus', 'virus', 'impfung', 'arzt', 'corona', 'pandemic'],
    science: ['science', 'wissenschaft', 'forschung', 'weltraum', 'klima', 'studie', 'space', 'climate', 'research'],
    sports: ['sport', 'fußball', 'tennis', 'olympia', 'liga', 'spieler', 'trainer', 'football', 'basketball'],
    technology: ['tech', 'technologie', 'ki', 'smartphone', 'internet', 'software', 'computer', 'artificial intelligence', 'cyber'],
  };
  for (const [cat, words] of Object.entries(map)) {
    if (words.some((w) => lower.includes(w))) return cat;
  }
  return defaultCategory || 'general';
}

function extractImage(item) {
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
    return item['media:content'].$.url;
  }
  // Try to extract first image from content:encoded
  const content = item['content:encoded'] || item.content || '';
  const match = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

function generateId(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h).toString(36);
}

function fetchFeedWithTimeout(feed, ms) {
  return Promise.race([
    rssParser.parseURL(feed.url).then((data) => ({ feed, data })),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function fetchNews() {
  const allArticles = [];
  const seen = new Set();

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        return await fetchFeedWithTimeout(feed, 4000);
      } catch (err) {
        console.error(`RSS feed failed: ${feed.url}`, err.message);
        return null;
      }
    })
  );

  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) continue;
    const { feed, data } = result.value;

    for (const item of data.items.slice(0, 12)) {
      const title = item.title || '';
      const desc = item.contentSnippet || item.content || '';
      const key = (title + desc).slice(0, 200);
      if (seen.has(key)) continue;
      seen.add(key);

      const category = inferCategory(`${title} ${desc}`, feed.category);
      const image = extractImage(item);

      allArticles.push({
        id: generateId(item.link + title),
        title,
        description: desc,
        content: desc,
        url: item.link,
        urlToImage: image,
        source: { name: feed.source, id: feed.source.toLowerCase().replace(/\s+/g, '-') },
        author: data.title || feed.source,
        publishedAt: item.isoDate || new Date().toISOString(),
        category,
        country: 'world',
      });
    }
  }

  // Sort by date descending
  allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return allArticles;
}

let cachedNews = [];
let lastFetch = 0;

async function getNews() {
  const now = Date.now();
  if (now - lastFetch > 5 * 60 * 1000 || cachedNews.length === 0) {
    try {
      cachedNews = await fetchNews();
      lastFetch = now;
    } catch (err) {
      console.error('News aggregation failed:', err);
    }
  }
  return cachedNews;
}

async function handler(req, res) {
  const urlPath = new URL(req.url, `http://${req.headers.host}`).pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (urlPath === '/api/news') {
    try {
      const news = await getNews();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', totalResults: news.length, articles: news }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: err.message }));
      return;
    }
  }

  if (urlPath === '/api/refresh') {
    try {
      cachedNews = await fetchNews();
      lastFetch = Date.now();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', totalResults: cachedNews.length, articles: cachedNews }));
      return;
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'error', message: err.message }));
      return;
    }
  }

  let filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer(handler);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`PulseWire server running at http://localhost:${PORT}`);
    // Pre-fetch news on startup
    getNews().then((news) => console.log(`Pre-fetched ${news.length} articles`));
  });
}

module.exports = handler;
