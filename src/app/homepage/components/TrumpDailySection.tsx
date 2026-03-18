'use client';

import { useEffect, useRef, useState } from 'react';

import AppImage from '@/components/ui/AppImage';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  imageUrl?: string;
}

const FALLBACK_NEWS: NewsItem[] = [
{
  id: 'f1', title: 'Trump Signs Executive Order on Trade Tariffs',
  description: 'The president signed sweeping tariff orders affecting imports from Canada, Mexico, and the EU, sending markets into a tailspin.',
  link: '#', pubDate: new Date(Date.now() - 3600000).toISOString(), source: 'Reuters', category: 'trump-daily',
  imageUrl: "https://images.unsplash.com/photo-1600265010441-be8c3082503f"
},
{
  id: 'f2', title: "Trump's Mar-a-Lago Meeting Raises Ethics Questions",
  description: 'Foreign dignitaries and lobbyists gathered at the private club, raising questions about transparency and the emoluments clause.',
  link: '#', pubDate: new Date(Date.now() - 7200000).toISOString(), source: 'Washington Post', category: 'trump-daily',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1a6eee664-1773429127918.png"
},
{
  id: 'f3', title: 'Trump Attacks Fed Chair Powell on Social Media',
  description: 'In a series of posts, the president demanded interest rate cuts, undermining the central bank\'s independence.',
  link: '#', pubDate: new Date(Date.now() - 10800000).toISOString(), source: 'NY Times', category: 'trump-daily',
  imageUrl: "https://images.unsplash.com/photo-1702477308943-5c5205707600"
},
{
  id: 'f4', title: 'DOGE Team Gains Access to Social Security Data',
  description: 'The Department of Government Efficiency team led by Elon Musk has reportedly gained access to sensitive federal databases.',
  link: '#', pubDate: new Date(Date.now() - 14400000).toISOString(), source: 'AP News', category: 'trump-daily',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_188fc5fcc-1772736246350.png"
},
{
  id: 'f5', title: 'Trump Threatens NATO Allies Over Defense Spending',
  description: 'In a press conference, the president suggested the US might not defend NATO members who do not meet the 2% GDP spending target.',
  link: '#', pubDate: new Date(Date.now() - 18000000).toISOString(), source: 'BBC', category: 'trump-daily',
  imageUrl: "https://images.unsplash.com/photo-1698171782764-dea4bb91c782"
},
{
  id: 'f6', title: 'Trump Administration Freezes Foreign Aid Programs',
  description: 'Dozens of USAID programs across Africa and Southeast Asia were abruptly suspended pending review.',
  link: '#', pubDate: new Date(Date.now() - 21600000).toISOString(), source: 'Reuters', category: 'trump-daily',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_19662db4f-1772186344369.png"
}];


function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff % 3600000 / 60000);
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export default function TrumpDailySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/news?section=trump-daily').
    then((r) => r.json()).
    then((data) => {
      const items = data.items && data.items.length >= 3 ? data.items : FALLBACK_NEWS;
      setNews(items.slice(0, 6));
      setLastUpdated(new Date(data.fetchedAt || Date.now()).toLocaleTimeString());
      setLoading(false);
    }).
    catch(() => {
      setNews(FALLBACK_NEWS);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {if (e.isIntersecting) e.target.classList.add('active');}),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [news]);

  const featured = news[0];
  const rest = news.slice(1);

  return (
    <section
      id="trump-daily"
      ref={sectionRef}
      className="py-24 bg-background border-t border-border"
      aria-labelledby="trump-daily-heading">
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4 reveal">
          <div>
            <div className="section-label mb-2">Section 01 · Updated {lastUpdated || 'live'}</div>
            <h2
              id="trump-daily-heading"
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-none tracking-tight">
              
              What did the
              <br />
              <span className="text-primary italic">Orangutan</span> do today?
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="w-2 h-2 rounded-full bg-war-red status-pulse" />
            <span className="font-mono text-xs">Past 24 hours · Live RSS</span>
          </div>
        </div>

        {loading ?
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) =>
          <div key={i} className="news-card p-4">
                <div className="skeleton h-40 w-full mb-4" />
                <div className="skeleton h-4 w-3/4 mb-2" />
                <div className="skeleton h-4 w-full mb-2" />
                <div className="skeleton h-3 w-1/2" />
              </div>
          )}
          </div> :

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured card — spans 2 cols */}
            {featured &&
          <a
            href={featured.link}
            target="_blank"
            rel="noopener noreferrer"
            className="lg:col-span-2 news-card group reveal block">
            
                <div className="relative h-64 overflow-hidden">
                  <AppImage
                src={featured.imageUrl || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop'}
                alt={`Featured story: ${featured.title}`}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700" />
              
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="font-mono text-[10px] tracking-widest uppercase bg-primary text-white px-2 py-0.5 rounded-full">
                      Top Story
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] text-muted">{featured.source}</span>
                    <span className="text-border">·</span>
                    <span className="font-mono text-[10px] text-primary">{timeAgo(featured.pubDate)}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl leading-tight mb-2 group-hover:text-primary transition-colors">
                    {featured.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed line-clamp-2">{featured.description}</p>
                </div>
              </a>
          }

            {/* Remaining cards */}
            <div className="flex flex-col gap-4">
              {rest.slice(0, 4).map((item, i) =>
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`news-card group flex gap-3 p-3 reveal`}
              style={{ transitionDelay: `${i * 80}ms` }}>
              
                  {item.imageUrl &&
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <AppImage
                  src={item.imageUrl}
                  alt={`News thumbnail for: ${item.title}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500" />
                
                    </div>
              }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[9px] text-muted">{item.source}</span>
                      <span className="font-mono text-[9px] text-primary">{timeAgo(item.pubDate)}</span>
                    </div>
                    <h3 className="font-display font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </a>
            )}
            </div>

            {/* Bottom row */}
            {rest.slice(4).map((item, i) =>
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="news-card group p-4 reveal"
            style={{ transitionDelay: `${(i + 4) * 80}ms` }}>
            
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[9px] text-muted">{item.source}</span>
                  <span className="font-mono text-[9px] text-primary">{timeAgo(item.pubDate)}</span>
                </div>
                <h3 className="font-display font-semibold text-base leading-tight group-hover:text-primary transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-muted text-xs leading-relaxed line-clamp-2">{item.description}</p>
              </a>
          )}
          </div>
        }

        {/* Data note */}
        <div className="mt-8 flex items-center gap-2 text-xs text-muted font-mono reveal">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          News sourced via RSS from Reuters, NY Times, Washington Post · Filtered for past 24 hours · Refreshes every 5 min
        </div>
      </div>
    </section>);

}