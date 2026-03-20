import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  // TODO: 'cover' category is defined but no feed populates it. Implement feed config or remove if unused.
  category: 'trump-daily' | 'mess' | 'wars' | 'cover';
  imageUrl?: string;
}

const TRUMP_STRICT = [
  'trump', 'donald trump', 'president trump', 'white house', 'mar-a-lago',
  'executive order', 'doge', 'maga', 'trump administration', 'melania',
  'ivanka', 'trump jr', 'vance', 'jd vance', 'rubio', 'elon musk',
  'bannon', 'oval office', 'trump signs', 'trump says', 'trump threatens',
  'trump claims', 'trump fires', 'trump orders'
];

const TRUMP_LOOSE = [
  ...TRUMP_STRICT,
  'tariff', 'tariffs', 'trade war', 'gop', 'republican', 'congress',
  'senate', 'federal agency', 'department of', 'doge cuts', 'budget cut',
  'nato', 'sanctions', 'us policy', 'administration', 'federal', 'treasury',
  'pentagon', 'state department', 'immigration', 'border', 'deportation'
];

const EPSTEIN_KEYWORDS = [
  'epstein', 'jeffrey epstein', 'epstein files', 'epstein list',
  'maxwell', 'ghislaine', 'epstein documents', 'epstein victims',
  'epstein associates', 'epstein island'
];

const CONFLICT_KEYWORDS = [
  'war', 'conflict', 'ceasefire', 'invasion', 'missile', 'airstrike',
  'troops', 'military', 'casualties', 'humanitarian', 'siege', 'offensive',
  'peace talks', 'nato', 'un security council', 'refugee', 'displacement'
];

function parseRSSDate(dateStr: string): string {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

function matchesKeywords(item: { title: string; description: string }, keywords: string[]): boolean {
  const text = `${item.title} ${item.description}`.toLowerCase();
  return keywords.some(kw => text.includes(kw.toLowerCase()));
}

// TODO: allorigins.win is a single point of failure. Consider a fallback proxy or server-side fetch if this becomes unreliable.
async function fetchRSS(url: string, timeout = 6000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    clearTimeout(timer);
    return await res.text();
  } catch (err) {
    clearTimeout(timer);
    console.error(`[fetchRSS] Failed: ${url}`, err instanceof Error ? err.message : err);
    return '';
  }
}

function parseItems(xml: string, source: string, category: NewsItem['category'], limit = 10): NewsItem[] {
  if (!xml) return [];
  const items: NewsItem[] = [];
  
  // TODO: Consider replacing regex XML parsing with fast-xml-parser for correctness on malformed or deeply nested RSS feeds.
  // Simple regex-based XML parsing for edge runtime
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  
  for (const itemXml of itemMatches.slice(0, limit)) {
    const getTag = (tag: string) => {
      const match = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return match ? (match[1] || match[2] || '').trim() : '';
    };
    
    const title = stripHtml(getTag('title'));
    const link = getTag('link') || getTag('guid');
    const description = stripHtml(getTag('description')).slice(0, 300);
    const pubDate = parseRSSDate(getTag('pubDate'));
    
    // Extract image from media:thumbnail or media:content or enclosure
    const thumbMatch = 
      itemXml.match(/media:thumbnail[^>]*\surl="([^"]+)"/i) ||
      itemXml.match(/media:thumbnail[^>]*\surl='([^']+)'/i) ||
      itemXml.match(/media:content[^>]*\surl="([^"]+)"/i) ||
      itemXml.match(/media:content[^>]*\surl='([^']+)'/i) ||
      itemXml.match(/<enclosure[^>]*\surl="([^"]+\.(jpg|jpeg|png|webp))"[^>]*/i);
    const imageUrl = thumbMatch ? (thumbMatch[1] || undefined) : undefined;
    
    if (title && link) {
      items.push({
        id: `${source}-${btoa(encodeURIComponent(link))}`,
        title,
        description,
        link,
        pubDate,
        source,
        category,
        imageUrl,
      });
    }
  }
  
  return items;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const VALID_SECTIONS = ['trump-daily', 'mess', 'wars', 'epstein', 'all'];
  const rawSection = (searchParams.get('section') || 'all').toLowerCase().trim();

  if (!VALID_SECTIONS.includes(rawSection)) {
    return NextResponse.json(
      { error: 'Invalid section. Valid values: trump-daily, mess, wars, epstein, all' },
      { status: 400 }
    );
  }

  const section = rawSection;
  
  try {
    const feeds: Record<string, { url: string; source: string; category: NewsItem['category'] }[]> = {
      'trump-daily': [
        { url: 'https://feeds.feedburner.com/thedailybeast/politics', source: 'Daily Beast', category: 'trump-daily' },
        { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'NY Times', category: 'trump-daily' },
        { url: 'https://thehill.com/rss/syndicator/19109', source: 'The Hill', category: 'trump-daily' },
        { url: 'https://feeds.theguardian.com/theguardian/us-news/rss', source: 'The Guardian', category: 'trump-daily' },
      ],
      'mess': [
        { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml', source: 'NY Times Economy', category: 'mess' },
        { url: 'https://thehill.com/rss/syndicator/19110', source: 'The Hill Business', category: 'mess' },
        { url: 'https://feeds.theguardian.com/theguardian/business/rss', source: 'The Guardian Business', category: 'mess' },
      ],
      'wars': [
        { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY Times World', category: 'wars' },
        { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', category: 'wars' },
        { url: 'https://feeds.theguardian.com/theguardian/world/rss', source: 'The Guardian World', category: 'wars' },
      ],
      'epstein': [
        { url: 'https://feeds.feedburner.com/thedailybeast/politics', source: 'Daily Beast', category: 'cover' },
        { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'NY Times', category: 'cover' },
        { url: 'https://thehill.com/rss/syndicator/19109', source: 'The Hill', category: 'cover' },
        { url: 'https://feeds.theguardian.com/theguardian/us-news/rss', source: 'The Guardian', category: 'cover' },
      ],
    };
    
    const targetFeeds = section === 'all' 
      ? Object.values(feeds).flat() 
      : feeds[section] || [];
    
    const results = await Promise.allSettled(
      targetFeeds.map(async (feed) => {
        const xml = await fetchRSS(feed.url);
        // allorigins wraps in JSON
        return parseItems(xml, feed.source, feed.category, 8);
      })
    );
    
    const rawItems: NewsItem[] = results
      .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    const allItems: NewsItem[] = section === 'trump-daily'
      ? rawItems.filter(item => matchesKeywords(item, TRUMP_STRICT))
      : section === 'mess'
      ? rawItems.filter(item => matchesKeywords(item, TRUMP_LOOSE))
      : section === 'epstein'
      ? rawItems.filter(item => matchesKeywords(item, EPSTEIN_KEYWORDS))
      : section === 'wars'
      ? rawItems.filter(item => matchesKeywords(item, CONFLICT_KEYWORDS))
      : rawItems;

    // Deduplicate by link across all items
    const seenLinks = new Set<string>();
    const dedupedItems = allItems.filter(item => {
      if (seenLinks.has(item.link)) return false;
      seenLinks.add(item.link);
      return true;
    });

    // Filter for relevant categories
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const filtered = section === 'trump-daily'
      ? dedupedItems.filter(item => {
          const pub = new Date(item.pubDate);
          return pub >= oneDayAgo;
        })
      : dedupedItems;

    return NextResponse.json({ 
      items: filtered,
      fetchedAt: now.toISOString(),
      total: filtered.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
  } catch (error) {
    return NextResponse.json({ items: [], fetchedAt: new Date().toISOString(), total: 0, error: 'Feed fetch failed' }, { status: 503 });
  }
}