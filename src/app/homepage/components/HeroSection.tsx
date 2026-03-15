'use client';

import { useEffect, useRef, useState } from 'react';

import AppImage from '@/components/ui/AppImage';

interface HeroArticle {
  title: string;
  description: string;
  link: string;
  source: string;
  pubDate: string;
  imageUrl?: string;
}

const FALLBACK_HERO: HeroArticle = {
  title: "Orangutan in Chief: A Week That Shook the World",
  description: "From trade wars to diplomatic standoffs, the past seven days have been a masterclass in chaos governance. Here's the full rundown of everything the Orangutan did this week.",
  link: "#",
  source: "OrangutanNews Editorial",
  pubDate: new Date().toISOString(),
  imageUrl: "https://images.unsplash.com/photo-1623959650463-88653b3688d8"
};

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const titleLeftRef = useRef<HTMLHeadingElement>(null);
  const titleRightRef = useRef<HTMLHeadingElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const [hero, setHero] = useState<HeroArticle>(FALLBACK_HERO);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Fetch top story for cover
    fetch('/api/news?section=trump-daily').
    then((r) => r.json()).
    then((data) => {
      if (data.items && data.items.length > 0) {
        const top = data.items[0];
        setHero({
          title: top.title,
          description: top.description,
          link: top.link,
          source: top.source,
          pubDate: top.pubDate,
          imageUrl: top.imageUrl || FALLBACK_HERO.imageUrl
        });
      }
      setLoaded(true);
    }).
    catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;

    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const containerHeight = container.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Progress: 0 when hero enters, 1 when hero leaves
        const scrolled = -rect.top;
        const total = containerHeight - viewportHeight;
        const progress = Math.max(0, Math.min(1, scrolled / total));

        if (mediaRef.current) {
          const startW = 320;
          const startH = 420;
          const w = startW + (window.innerWidth - startW) * progress;
          const h = startH + (viewportHeight - startH) * progress;
          const br = Math.max(0, 32 - 32 * progress);
          mediaRef.current.style.width = `${w}px`;
          mediaRef.current.style.height = `${h}px`;
          mediaRef.current.style.borderRadius = `${br}px`;
        }

        if (bgRef.current) {
          bgRef.current.style.opacity = `${1 - progress * 2}`;
        }

        if (titleLeftRef.current) {
          titleLeftRef.current.style.transform = `translateX(${-progress * 110}vw)`;
          titleLeftRef.current.style.opacity = `${1 - progress * 2}`;
        }

        if (titleRightRef.current) {
          titleRightRef.current.style.transform = `translateX(${progress * 110}vw)`;
          titleRightRef.current.style.opacity = `${1 - progress * 2}`;
        }

        if (expandedRef.current) {
          const show = Math.max(0, (progress - 0.6) / 0.4);
          expandedRef.current.style.opacity = `${show}`;
          expandedRef.current.style.transform = `translateY(${(1 - show) * 30}px)`;
          expandedRef.current.style.pointerEvents = show > 0.5 ? 'auto' : 'none';
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const formattedDate = hero.pubDate ?
  new Date(hero.pubDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) :
  '';

  return (
    <section id="expansion-hero-container" ref={containerRef} aria-label="Cover Story">
      <div id="expansion-hero-sticky" className="noise-overlay">
        {/* Background image */}
        <div
          ref={bgRef}
          className="absolute inset-0 z-0"
          style={{ transition: 'opacity 0.1s' }}>
          
          <AppImage
            src="https://images.unsplash.com/photo-1549341693-a2602d2cf6b0"
            alt="Capitol building aerial view with dramatic sky"
            fill
            className="object-cover"
            priority />
          
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/30 to-foreground/80" />
        </div>

        {/* Expanding media */}
        <div
          ref={mediaRef}
          className="absolute z-20 overflow-hidden"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '320px',
            height: '420px',
            borderRadius: '32px',
            boxShadow: '0 40px 120px rgba(26,10,0,0.6)',
            transition: 'box-shadow 0.3s'
          }}>
          
          <AppImage
            src={hero.imageUrl || FALLBACK_HERO.imageUrl!}
            alt={`Cover story: ${hero.title}`}
            fill
            className="object-cover"
            priority />
          
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />

          {/* Small label on media card */}
          <div className="absolute top-4 left-4 z-10">
            <span className="font-mono text-[10px] tracking-widest uppercase bg-primary text-white px-2.5 py-1 rounded-full">
              Cover Story
            </span>
          </div>
        </div>

        {/* Hero titles */}
        <div
          className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          aria-hidden="true">
          
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <h1
              ref={titleLeftRef}
              className="font-display font-black text-white hero-text-shadow"
              style={{
                fontSize: 'clamp(2.5rem, 7vw, 6rem)',
                lineHeight: 0.9,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                transition: 'transform 0.05s, opacity 0.05s'
              }}>
              
              🦧 Top Story
            </h1>
            <h2
              ref={titleRightRef}
              className="font-display italic font-light text-white/70 hero-text-shadow"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                transition: 'transform 0.05s, opacity 0.05s'
              }}>
              
              of the Week
            </h2>
          </div>
        </div>

        {/* Expanded content (appears after scroll) */}
        <div
          ref={expandedRef}
          className="absolute bottom-0 left-0 w-full z-50 px-6 pb-12"
          style={{ opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s, transform 0.2s' }}>
          
          <div className="max-w-3xl mx-auto">
            <div className="glass-dark rounded-2xl p-6 md:p-8 orange-glow">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] tracking-widest uppercase text-primary">Cover Story</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="font-mono text-[10px] text-white/50">{formattedDate}</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="font-mono text-[10px] text-white/50">{hero.source}</span>
              </div>
              <h2 className="font-display font-bold text-white text-2xl md:text-3xl leading-tight mb-3">
                {hero.title}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed mb-5 line-clamp-3">
                {hero.description}
              </p>
              <div className="flex items-center gap-4">
                <a
                  href={hero.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">
                  
                  Read Full Story
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a href="#trump-daily" className="text-white/50 text-sm hover:text-white transition-colors">
                  Scroll for more ↓
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-white/60">
          <span className="font-mono text-[10px] tracking-widest uppercase">Scroll to reveal</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/60 to-transparent animate-bounce" />
        </div>
      </div>
    </section>);

}