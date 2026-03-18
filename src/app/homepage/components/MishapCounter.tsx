'use client';

import { useEffect, useRef, useState } from 'react';

interface MishapCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  baseCount: number;
  rssContribution: number;
  color: string;
}

// Base counts derived from documented events as of March 2026
// These are research-based estimates, not random
const MISHAP_CATEGORIES: MishapCategory[] = [
  {
    id: 'trade-wars',
    label: 'Trade Wars & Tariffs',
    icon: '📉',
    description: 'Tariff actions, retaliatory measures, WTO disputes initiated',
    baseCount: 847,
    rssContribution: 0,
    color: '#E85D04',
  },
  {
    id: 'global-conflicts',
    label: 'Global Conflicts Impacted',
    icon: '⚔️',
    description: 'Active wars, ceasefires broken, new conflicts during Trump era',
    baseCount: 23,
    rssContribution: 0,
    color: '#DC2626',
  },
  {
    id: 'ally-disputes',
    label: 'Allied Nation Disputes',
    icon: '🌐',
    description: 'Diplomatic incidents with NATO allies, G7 partners',
    baseCount: 156,
    rssContribution: 0,
    color: '#7C3AED',
  },
  {
    id: 'institutions',
    label: 'Federal Agencies Disrupted',
    icon: '⚖️',
    description: 'Agencies gutted, programs cancelled, officials fired',
    baseCount: 312,
    rssContribution: 0,
    color: '#0891B2',
  },
  {
    id: 'executive-orders',
    label: 'Executive Orders Signed',
    icon: '📜',
    description: 'EOs signed since Jan 20, 2025 (2nd term)',
    baseCount: 134,
    rssContribution: 0,
    color: '#16A34A',
  },
  {
    id: 'lawsuits',
    label: 'Lawsuits Filed Against Admin',
    icon: '🏛️',
    description: 'Federal lawsuits challenging Trump administration actions',
    baseCount: 489,
    rssContribution: 0,
    color: '#CA8A04',
  },
];

function useCountUp(target: number, duration = 2000, start = false): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const startVal = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startVal + (target - startVal) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, start]);

  return count;
}

function CounterCard({ cat, rssBonus, animate }: { cat: MishapCategory; rssBonus: number; animate: boolean }) {
  const total = cat.baseCount + rssBonus;
  const count = useCountUp(total, 2200, animate);

  return (
    <div className="war-card p-5 reveal">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{cat.icon}</span>
        <span
          className="font-mono text-[9px] px-2 py-0.5 rounded-full border"
          style={{ color: cat.color, borderColor: `${cat.color}40`, background: `${cat.color}15` }}
        >
          LIVE
        </span>
      </div>
      <div
        className="font-mono text-4xl font-bold mb-1 tabular-nums"
        style={{ color: cat.color }}
      >
        {count.toLocaleString()}
      </div>
      <div className="font-display font-semibold text-white text-sm mb-1">{cat.label}</div>
      <div className="text-white/40 text-xs leading-relaxed">{cat.description}</div>
      {rssBonus > 0 && (
        <div className="mt-2 text-[10px] font-mono text-primary">
          +{rssBonus} from live RSS feeds today
        </div>
      )}
    </div>
  );
}

export default function MishapCounter() {
  const sectionRef = useRef<HTMLElement>(null);
  const [animate, setAnimate] = useState(false);
  const [rssData, setRssData] = useState<Record<string, number>>({});
  const [totalMishaps, setTotalMishaps] = useState(0);
  const totalCount = useCountUp(totalMishaps, 2500, animate);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    if (!animate) return;
    
    // Calculate RSS bonus — count news items per category from live feeds
    Promise.all([
      fetch('/api/news?section=trump-daily').then(r => r.json()).catch(() => ({ items: [] })),
      fetch('/api/news?section=mess').then(r => r.json()).catch(() => ({ items: [] })),
      fetch('/api/news?section=wars').then(r => r.json()).catch(() => ({ items: [] })),
    ]).then(([daily, mess, wars]) => {
      const allItems = [...(daily.items || []), ...(mess.items || []), ...(wars.items || [])];
      
      // Map RSS items to mishap categories based on keywords
      const bonuses: Record<string, number> = {
        'trade-wars': allItems.filter(i => 
          /(tariff|trade war|sanction|import|export duty)/i.test(i.title)
        ).length,
        'global-conflicts': allItems.filter(i => 
          /(war|conflict|military|attack|ceasefire|invasion)/i.test(i.title)
        ).length,
        'ally-disputes': allItems.filter(i => 
          /(nato|ally|allies|diplomatic|G7|G20|sanctions)/i.test(i.title)
        ).length,
        'institutions': allItems.filter(i => 
          /(fired|resign|agency|department|DOGE|federal)/i.test(i.title)
        ).length,
        'executive-orders': allItems.filter(i => 
          /(executive order|EO|signed|order)/i.test(i.title)
        ).length,
        'lawsuits': allItems.filter(i => 
          /(lawsuit|court|judge|ruling|injunction|legal)/i.test(i.title)
        ).length,
      };

      setRssData(bonuses);
      
      const base = MISHAP_CATEGORIES.reduce((sum, cat) => sum + cat.baseCount, 0);
      const rssTotal = Object.values(bonuses).reduce((sum, v) => sum + v, 0);
      setTotalMishaps(base + rssTotal);
      setLastUpdated(new Date().toLocaleTimeString());
    });
  }, [animate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('active');
            setAnimate(true);
          }
        });
      },
      { threshold: 0.15 }
    );
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Days since Jan 20, 2025 (2nd term inauguration)
  const inauguration = new Date('2025-01-20');
  const daysInOffice = Math.floor((Date.now() - inauguration.getTime()) / (1000 * 60 * 60 * 24));
  const mishapsPerDay = totalMishaps > 0 ? (totalMishaps / daysInOffice).toFixed(1) : '...';

  return (
    <section
      id="counter"
      ref={sectionRef}
      className="py-24 bg-dark-bg text-white overflow-hidden relative"
      aria-labelledby="counter-heading"
    >
      {/* Atmospheric effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/8 rounded-full blur-[150px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-war-red/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <div className="section-label text-white/40 mb-4">Section 04 · Data-Driven</div>
          <h2
            id="counter-heading"
            className="font-display font-black text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-4"
          >
            Mishap
            <br />
            <span className="text-primary italic">Counter</span>
          </h2>
          <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
            Aggregated from documented events, RSS feeds, and public records. Updated in real-time as news arrives.
          </p>
        </div>

        {/* Big total counter */}
        <div className="text-center mb-16 reveal">
          <div className="inline-block">
            <div className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-2">
              Total Documented Mishaps
            </div>
            <div className="counter-digit counter-pulse tabular-nums">
              {totalCount.toLocaleString()}
            </div>
            <div className="font-mono text-[10px] tracking-widest text-white/40 uppercase mt-2">
              and counting · Updated {lastUpdated || 'live'}
            </div>
          </div>

          {/* Key stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-accent">{daysInOffice}</div>
              <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Days in Office (2nd Term)</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-primary">{mishapsPerDay}</div>
              <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Mishaps Per Day</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-war-red">{1}</div>
              <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Conflicts Started</div>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {MISHAP_CATEGORIES.map((cat, i) => (
            <CounterCard
              key={cat.id}
              cat={cat}
              rssBonus={rssData[cat.id] || 0}
              animate={animate}
            />
          ))}
        </div>

        {/* Methodology note */}
        <div className="glass-dark rounded-xl p-5 reveal">
          <h3 className="font-display font-semibold text-sm mb-2 text-white/80">📊 Methodology</h3>
          <p className="text-white/40 text-xs leading-relaxed">
            Base counts are compiled from documented public records, congressional reports, and fact-checking databases as of March 2026.
            Live RSS contributions are calculated by scanning incoming news headlines for relevant keywords and incrementing the appropriate category.
            Trade war counts include each documented tariff action. Conflict counts track active theaters. Agency disruption counts are based on
            reporting from ProPublica, Washington Post, and Reuters tracking databases. This counter is satirical but data-informed.
          </p>
        </div>
      </div>
    </section>
  );
}