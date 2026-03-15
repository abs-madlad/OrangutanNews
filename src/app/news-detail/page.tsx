'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';

interface ArticleData {
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate: string;
  category: string;
  imageUrl?: string;
}

const SECTION_CONFIG: Record<string, {label: string;color: string;bg: string;icon: string;}> = {
  'trump-daily': { label: "What the Orangutan Did", color: '#E85D04', bg: 'rgba(232,93,4,0.12)', icon: '🦧' },
  'mess': { label: 'The Mess', color: '#DC2626', bg: 'rgba(220,38,38,0.12)', icon: '💥' },
  'wars': { label: 'The Wars', color: '#7C3AED', bg: 'rgba(124,58,237,0.12)', icon: '⚔️' },
  'cover': { label: 'Cover Story', color: '#16A34A', bg: 'rgba(22,163,74,0.12)', icon: '📰' }
};

const RELATED_FALLBACK: ArticleData[] = [
{
  title: 'Trump Signs New Executive Orders Targeting Federal Employees',
  description: 'A sweeping set of executive orders reshapes federal workforce protections.',
  link: '#', source: 'Reuters', pubDate: new Date(Date.now() - 3600000).toISOString(),
  category: 'trump-daily',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_134c3f062-1772618977979.png"
},
{
  title: 'Global Markets React to US Tariff Announcements',
  description: 'Asian and European markets fell sharply after new tariff announcements.',
  link: '#', source: 'AP News', pubDate: new Date(Date.now() - 7200000).toISOString(),
  category: 'mess',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1dad0aa0d-1766114485221.png"
},
{
  title: 'Ukraine Ceasefire Negotiations Stall Again',
  description: 'Talks mediated by the US special envoy collapsed after disagreements.',
  link: '#', source: 'BBC', pubDate: new Date(Date.now() - 14400000).toISOString(),
  category: 'wars',
  imageUrl: "https://images.unsplash.com/photo-1632999876108-cb4417bcb224"
}];


function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return 'Just now';
}

function ArticleContent() {
  const searchParams = useSearchParams();
  const sectionRef = useRef<HTMLElement>(null);

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [related, setRelated] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract params
  const title = searchParams.get('title') || '';
  const description = searchParams.get('description') || '';
  const link = searchParams.get('link') || '#';
  const source = searchParams.get('source') || 'OrangutanNews';
  const pubDate = searchParams.get('pubDate') || new Date().toISOString();
  const category = searchParams.get('category') || 'trump-daily';
  const imageUrl = searchParams.get('imageUrl') || '';

  useEffect(() => {
    if (title) {
      setArticle({ title, description, link, source, pubDate, category, imageUrl: imageUrl || undefined });
    }

    // Fetch related articles
    fetch('/api/news?section=trump-daily').
    then((r) => r.json()).
    then((data) => {
      const items = data.items && data.items.length >= 2 ? data.items.slice(0, 4) : RELATED_FALLBACK;
      setRelated(items.filter((i: ArticleData) => i.title !== title).slice(0, 3));
      setLoading(false);
    }).
    catch(() => {
      setRelated(RELATED_FALLBACK);
      setLoading(false);
    });
  }, [title, description, link, source, pubDate, category, imageUrl]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {if (e.isIntersecting) e.target.classList.add('active');}),
      { threshold: 0.08 }
    );
    sectionRef.current?.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [article, related]);

  const sectionCfg = SECTION_CONFIG[category] || SECTION_CONFIG['trump-daily'];
  const formattedDate = new Date(pubDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (!title && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🦧</div>
          <h1 className="font-display font-bold text-2xl mb-3">Article Not Found</h1>
          <p className="text-muted text-sm mb-6">The article you're looking for doesn't exist or wasn't passed correctly.</p>
          <Link href="/homepage" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors">
            ← Back to OrangutanNews
          </Link>
        </div>
      </div>);

  }

  return (
    <main ref={sectionRef} className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-muted mb-8 reveal" aria-label="Breadcrumb">
          <Link href="/homepage" className="hover:text-primary transition-colors">OrangutanNews</Link>
          <span className="opacity-40">›</span>
          <span style={{ color: sectionCfg.color }}>{sectionCfg.icon} {sectionCfg.label}</span>
          <span className="opacity-40">›</span>
          <span className="opacity-60 truncate max-w-xs">{title.slice(0, 50)}...</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main article */}
          <article className="lg:col-span-2">
            {/* Category badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold font-mono mb-6 reveal"
              style={{ color: sectionCfg.color, background: sectionCfg.bg, border: `1px solid ${sectionCfg.color}30` }}>
              
              {sectionCfg.icon} {sectionCfg.label.toUpperCase()}
            </div>

            {/* Headline */}
            <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight mb-6 reveal">
              {title || 'Loading article...'}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-border reveal">
              <span className="font-mono text-sm font-semibold text-foreground">{source}</span>
              <span className="text-border">·</span>
              <span className="font-mono text-sm text-muted">{formattedDate}</span>
              <span className="text-border">·</span>
              <span className="font-mono text-xs text-primary">{timeAgo(pubDate)}</span>
            </div>

            {/* Hero image */}
            {imageUrl &&
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-8 reveal">
                <AppImage
                src={imageUrl}
                alt={`Article image for: ${title}`}
                fill
                className="object-cover"
                priority />
              
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
              </div>
            }

            {/* Article body */}
            <div className="prose max-w-none reveal">
              <p className="text-lg leading-relaxed text-foreground mb-6 font-medium">
                {description}
              </p>

              {/* Extended content — generated contextually */}
              <div className="space-y-4 text-base leading-relaxed text-muted">
                <p>
                  This story is being tracked as part of OrangutanNews's ongoing coverage of the Trump presidency's impact on domestic and international affairs. The article above was sourced directly from <strong className="text-foreground">{source}</strong> via RSS feed and represents their editorial position.
                </p>
                <p>
                  OrangutanNews aggregates news from multiple sources including Reuters, BBC, AP News, the New York Times, and Washington Post to provide comprehensive coverage of events during the Trump administration.
                </p>
                <div
                  className="border-l-4 pl-5 py-2 my-6 rounded-r-lg"
                  style={{ borderColor: sectionCfg.color, background: sectionCfg.bg }}>
                  
                  <p className="text-sm font-mono" style={{ color: sectionCfg.color }}>
                    {sectionCfg.icon} This article falls under the <strong>{sectionCfg.label}</strong> category — {
                    category === 'trump-daily' ? "tracking the president's actions in the past 24 hours." :
                    category === 'mess' ? "documenting events caused by direct or indirect effects of the Trump presidency." :
                    category === 'wars' ? "monitoring global conflicts and Trump's claimed involvement." : "our top story of the week."
                    }
                  </p>
                </div>
                <p>
                  For the full original article, click the button below to read the complete story on {source}'s website.
                </p>
              </div>
            </div>

            {/* Read original CTA */}
            <div className="mt-8 flex flex-wrap gap-4 reveal">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition-all hover:shadow-lg">
                
                Read Full Story on {source}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <Link
                href="/homepage"
                className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded-full font-semibold hover:border-primary hover:text-primary transition-all">
                
                ← Back to Homepage
              </Link>
            </div>

            {/* Share */}
            <div className="mt-8 pt-6 border-t border-border reveal">
              <p className="font-mono text-xs text-muted mb-3 uppercase tracking-widest">Share this story</p>
              <div className="flex gap-3">
                {[
                { label: 'Twitter / X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(link)}`, color: '#1DA1F2' },
                { label: 'Reddit', href: `https://reddit.com/submit?url=${encodeURIComponent(link)}&title=${encodeURIComponent(title)}`, color: '#FF4500' }].
                map((s) =>
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg text-xs font-semibold font-mono border border-border hover:border-current transition-colors"
                  style={{ color: s.color }}>
                  
                    {s.label}
                  </a>
                )}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Section info */}
            <div
              className="rounded-2xl p-5 mb-6 reveal"
              style={{ background: sectionCfg.bg, border: `1px solid ${sectionCfg.color}25` }}>
              
              <div className="text-2xl mb-2">{sectionCfg.icon}</div>
              <h2 className="font-display font-bold text-lg mb-2" style={{ color: sectionCfg.color }}>
                {sectionCfg.label}
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                {category === 'trump-daily' && "Stories from the past 24 hours tracking the president's actions, statements, and decisions."}
                {category === 'mess' && "Events caused directly or indirectly by Trump presidency policies, decisions, and rhetoric."}
                {category === 'wars' && "Global conflicts with tracking of Trump's involvement claims and presidency-era escalations."}
                {category === 'cover' && "The top story of the week as selected by OrangutanNews editors."}
              </p>
              <Link
                href={`/homepage#${category === 'trump-daily' ? 'trump-daily' : category === 'mess' ? 'the-mess' : category === 'wars' ? 'wars' : 'trump-daily'}`}
                className="inline-flex items-center gap-1 mt-3 text-xs font-mono font-semibold hover:underline"
                style={{ color: sectionCfg.color }}>
                
                View all {sectionCfg.label} stories →
              </Link>
            </div>

            {/* Related articles */}
            <div className="reveal">
              <h2 className="font-display font-bold text-lg mb-4">Related Stories</h2>
              <div className="space-y-4">
                {loading ?
                [...Array(3)].map((_, i) =>
                <div key={i} className="flex gap-3">
                      <div className="skeleton w-16 h-16 rounded-lg flex-shrink-0" />
                      <div className="flex-1">
                        <div className="skeleton h-3 w-full mb-2" />
                        <div className="skeleton h-3 w-3/4" />
                      </div>
                    </div>
                ) :

                related.map((item, i) => {
                  const relCfg = SECTION_CONFIG[item.category] || SECTION_CONFIG['trump-daily'];
                  const params = new URLSearchParams({
                    title: item.title,
                    description: item.description,
                    link: item.link,
                    source: item.source,
                    pubDate: item.pubDate,
                    category: item.category,
                    ...(item.imageUrl ? { imageUrl: item.imageUrl } : {})
                  });
                  return (
                    <Link
                      key={i}
                      href={`/news-detail?${params.toString()}`}
                      className="flex gap-3 group news-card p-3">
                      
                        {item.imageUrl &&
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                            <AppImage
                          src={item.imageUrl}
                          alt={`Related article thumbnail: ${item.title}`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        
                          </div>
                      }
                        <div className="flex-1 min-w-0">
                          <div
                          className="font-mono text-[9px] mb-1 font-semibold"
                          style={{ color: relCfg.color }}>
                          
                            {relCfg.icon} {relCfg.label}
                          </div>
                          <h3 className="font-display font-semibold text-xs leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="font-mono text-[9px] text-muted mt-1">{timeAgo(item.pubDate)}</div>
                        </div>
                      </Link>);

                })
                }
              </div>
            </div>

            {/* Back to sections */}
            <div className="mt-6 reveal">
              <h3 className="font-mono text-[10px] tracking-widest text-muted uppercase mb-3">Browse Sections</h3>
              <div className="space-y-2">
                {Object.entries(SECTION_CONFIG).map(([key, cfg]) =>
                <Link
                  key={key}
                  href={`/homepage#${key === 'trump-daily' ? 'trump-daily' : key === 'mess' ? 'the-mess' : key}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary transition-colors group">
                  
                    <span className="text-lg">{cfg.icon}</span>
                    <span className="font-display font-semibold text-sm group-hover:text-primary transition-colors">{cfg.label}</span>
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>);

}

export default function NewsDetailPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
      <div className="pt-28 pb-20 min-h-screen max-w-7xl mx-auto px-6">
          <div className="skeleton h-6 w-48 mb-8 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="skeleton h-12 w-full rounded" />
              <div className="skeleton h-8 w-3/4 rounded" />
              <div className="skeleton h-72 w-full rounded-2xl" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-5/6 rounded" />
              <div className="skeleton h-4 w-4/5 rounded" />
            </div>
            <div className="lg:col-span-1 space-y-4">
              <div className="skeleton h-32 w-full rounded-2xl" />
              <div className="skeleton h-24 w-full rounded" />
            </div>
          </div>
        </div>
      }>
        <ArticleContent />
      </Suspense>
      <Footer />
    </>);

}