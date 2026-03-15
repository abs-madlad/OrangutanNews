import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: 'trump-daily' | 'mess' | 'wars' | 'cover';
  imageUrl?: string;
}

function parseRSSDate(dateStr: string): string {
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function extractImage(item: Element): string | undefined {
  const mediaContent = item.querySelector('content');
  const enclosure = item.querySelector('enclosure');
  const mediaThumb = item.querySelector('thumbnail');
  
  if (mediaThumb?.getAttribute('url')) return mediaThumb.getAttribute('url') || undefined;
  if (mediaContent?.getAttribute('url')) return mediaContent.getAttribute('url') || undefined;
  if (enclosure?.getAttribute('url')) return enclosure.getAttribute('url') || undefined;
  
  const desc = item.querySelector('description')?.textContent || '';
  const imgMatch = desc.match(/src="([^"]+\.(jpg|jpeg|png|webp))"/i);
  if (imgMatch) return imgMatch[1];
  
  return undefined;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

async function fetchRSS(url: string, timeout = 8000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'OrangutanNews/1.0 RSS Reader' },
    });
    clearTimeout(timer);
    return await res.text();
  } catch {
    clearTimeout(timer);
    return '';
  }
}

function parseItems(xml: string, source: string, category: NewsItem['category'], limit = 10): NewsItem[] {
  if (!xml) return [];
  const items: NewsItem[] = [];
  
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
        id: `${source}-${Buffer.from(link).toString('base64').slice(0, 12)}`,
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
        const xml = await fetchRSS(
          `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`
        );
        // allorigins wraps in JSON
        let content = xml;
        try {
          const parsed = JSON.parse(xml);
          content = parsed.contents || xml;
        } catch {
          content = xml;
        }
        return parseItems(content, feed.source, feed.category, 8);
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
    return NextResponse.json({ items: [], fetchedAt: new Date().toISOString(), total: 0, error: 'Feed fetch failed' }, { status: 200 });
  }
}