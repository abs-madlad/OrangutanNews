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

// TODO: allorigins.win is a single point of failure. Consider a fallback proxy or server-side fetch if this becomes unreliable.
async function fetchRSS(url: string, timeout = 10000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'OrangutanNews/1.0 RSS Reader' },
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
    
    // Extract image from media:thumbnail or media:content
    const thumbMatch = itemXml.match(/media:thumbnail[^>]+url="([^"]+)"/i) || 
                       itemXml.match(/media:content[^>]+url="([^"]+)"/i);
    const imageUrl = thumbMatch ? thumbMatch[1] : undefined;
    
    if (title && link) {
      items.push({
        id: `${source}-${btoa(encodeURIComponent(link)).slice(0, 12)}`,
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
  const section = searchParams.get('section') || 'all';
  
  try {
    const feeds: Record<string, { url: string; source: string; category: NewsItem['category'] }[]> = {
      'trump-daily': [
        { url: 'https://feeds.feedburner.com/thedailybeast/politics', source: 'Daily Beast', category: 'trump-daily' },
        { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'NY Times', category: 'trump-daily' },
        { url: 'https://feeds.washingtonpost.com/rss/politics', source: 'Washington Post', category: 'trump-daily' },
      ],
      'mess': [
        { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml', source: 'NY Times Economy', category: 'mess' },
        { url: 'https://feeds.washingtonpost.com/rss/business', source: 'Washington Post Business', category: 'mess' },
        { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters Business', category: 'mess' },
      ],
      'wars': [
        { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY Times World', category: 'wars' },
        { url: 'https://feeds.reuters.com/reuters/worldNews', source: 'Reuters World', category: 'wars' },
        { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', category: 'wars' },
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
    
    const allItems: NewsItem[] = results
      .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
      .flatMap(r => r.value);
    
    // Filter for relevant categories
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const filtered = section === 'trump-daily'
      ? allItems.filter(item => {
          const pub = new Date(item.pubDate);
          return pub >= oneDayAgo;
        })
      : allItems;
    
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