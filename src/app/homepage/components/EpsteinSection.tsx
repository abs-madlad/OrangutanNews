'use client';

import { useEffect, useRef, useState } from 'react';

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

const FALLBACK_EPSTEIN: NewsItem[] = [
  {
    id: 'e1',
    title: 'Epstein Documents: What the Released Files Reveal',
    description: 'Newly unsealed court documents shed light on the network surrounding Jeffrey Epstein, including names previously kept from public record.',
    link: '#', pubDate: new Date(Date.now() - 86400000).toISOString(),
    source: 'Editorial', category: 'cover',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop'
  },
  {
    id: 'e2',
    title: 'Trump Administration and the Epstein Files: A Timeline',
    description: 'A chronological breakdown of the current administration\'s relationship to the Epstein case and what has — and has not — been disclosed.',
    link: '#', pubDate: new Date(Date.now() - 172800000).toISOString(),
    source: 'Editorial', category: 'cover',
    imageUrl: 'https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=800&auto=format&fit=crop'
  },
  {
    id: 'e3',
    title: 'Maxwell Sentencing and the Questions Still Unanswered',
    description: 'Despite Ghislaine Maxwell\'s conviction, survivors and investigators say the full scope of the trafficking network has never been made public.',
    link: '#', pubDate: new Date(Date.now() - 259200000).toISOString(),
    source: 'Editorial', category: 'cover',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop'
  },
];

export default function EpsteinSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news?section=epstein')
      .then(r => r.json())
      .then(data => {
        const items = data.items && data.items.length >= 2 ? data.items : FALLBACK_EPSTEIN;
        setNews(items.slice(0, 8));
        setLoading(false);
      })
      .catch(() => {
        setNews(FALLBACK_EPSTEIN);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); }),
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [news]);

  return (
    <section
      id="epstein-files"
      ref={sectionRef}
      className="py-24 bg-dark-bg text-white overflow-hidden relative"
      aria-labelledby="epstein-heading"
    >
      {/* Atmospheric effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-war-red/8 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-14 reveal">
          <div className="section-label text-white/40 mb-3">Section 05 · Classified</div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2
              id="epstein-heading"
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-none tracking-tight"
            >
              The <span className="text-war-red italic">Epstein</span>
              <br />
              <span className="text-white/40 font-light text-3xl md:text-4xl">Files</span>
            </h2>
            <p className="text-white/50 max-w-sm text-sm leading-relaxed lg:text-right">
              Tracking every development in the Epstein documents case — 
              who is named, what is revealed, and what remains buried.
            </p>
          </div>
          {/* Redacted tape effect */}
          <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded border border-war-red/30 bg-war-red/10">
            <span className="w-2 h-2 rounded-full bg-war-red status-pulse" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-war-red">
              Live feed · Documents unsealed · Public record
            </span>
          </div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="war-card p-5">
                <div className="h-4 w-1/3 mb-4 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-5 w-full mb-2 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="h-4 w-3/4 mb-4 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="h-3 w-1/4 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {news.map((item, i) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="war-card group reveal block"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                {item.imageUrl && (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover brightness-60 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-transparent" />
                  </div>
                )}
                <div className="p-5">
                  {/* Redacted-style source tag */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border border-war-red/40 text-war-red bg-war-red/10">
                      {item.source}
                    </span>
                    <span className="font-mono text-[9px] text-white/30">
                      {new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm leading-snug mb-2 group-hover:text-war-red transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-white/40 text-xs leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-mono text-white/30 group-hover:text-war-red transition-colors">
                    <span>Read document</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-8 text-xs text-white/30 font-mono reveal">
          ⚡ Sourced from live RSS feeds · Filtered for Epstein case coverage · Updates every 5 minutes
        </div>
      </div>
    </section>
  );
}
