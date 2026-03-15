'use client';

import { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';

interface ConflictData {
  id: string;
  name: string;
  region: string;
  status: 'active' | 'ceasefire' | 'escalating';
  startedUnderTrump: boolean;
  trumpClaimedCredit: boolean;
  trumpCreditQuote?: string;
  description: string;
  casualties?: string;
  imageUrl: string;
  latestNews?: {
    title: string;
    link: string;
    source: string;
    pubDate: string;
  };
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: '#DC2626', bg: 'rgba(220,38,38,0.15)' },
  ceasefire: { label: 'Ceasefire', color: '#16A34A', bg: 'rgba(22,163,74,0.15)' },
  escalating: { label: 'Escalating', color: '#E85D04', bg: 'rgba(232,93,4,0.15)' }
};

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

export default function WarsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [liveNews, setLiveNews] = useState<NewsItem[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const conflicts: ConflictData[] = [
  {
    id: 'ukraine',
    name: 'Russia-Ukraine War',
    region: 'Eastern Europe',
    status: 'active',
    startedUnderTrump: false,
    trumpClaimedCredit: true,
    trumpCreditQuote: '"I will end this war in 24 hours. I already have a plan." — Trump, 2024. Still ongoing as of 2026.',
    description: 'Ongoing since February 2022. Trump has repeatedly claimed he can end the war immediately but negotiations have stalled.',
    casualties: '500,000+',
    imageUrl: "https://images.unsplash.com/photo-1733743801280-89c7bc5925d8"
  },
  {
    id: 'gaza',
    name: 'Israel-Gaza War',
    region: 'Middle East',
    status: 'active',
    startedUnderTrump: false,
    trumpClaimedCredit: true,
    trumpCreditQuote: '"Because of me, there will be a deal. I got it done." — Trump claimed credit for Jan 2025 ceasefire that later collapsed.',
    description: 'Escalated October 2023. Trump brokered a temporary ceasefire in January 2025, but conflict resumed. Over 50,000 Palestinian casualties.',
    casualties: '50,000+',
    imageUrl: "https://images.unsplash.com/photo-1720642591649-efd907f0f234"
  },
  {
    id: 'sudan',
    name: 'Sudan Civil War',
    region: 'East Africa',
    status: 'active',
    startedUnderTrump: false,
    trumpClaimedCredit: false,
    description: 'The RSF vs SAF conflict since April 2023 has created the world\'s largest displacement crisis. US aid programs gutted by DOGE cuts.',
    casualties: '150,000+',
    imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1f0cc7a01-1765011326410.png"
  },
  {
    id: 'trade-war-china',
    name: 'US-China Trade War',
    region: 'Global',
    status: 'escalating',
    startedUnderTrump: true,
    trumpClaimedCredit: false,
    description: 'Trump\'s second-term tariffs (up to 145% on Chinese goods) triggered retaliatory measures from Beijing, impacting global supply chains.',
    casualties: '$2T+ economic impact',
    imageUrl: "https://images.unsplash.com/photo-1729860648568-e36e42a5fce3"
  },
  {
    id: 'haiti',
    name: 'Haiti Gang Crisis',
    region: 'Caribbean',
    status: 'active',
    startedUnderTrump: false,
    trumpClaimedCredit: false,
    description: 'Gang control of over 85% of Port-au-Prince has created a humanitarian catastrophe. US aid suspension worsened the crisis.',
    casualties: '8,000+ in 2024',
    imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_2e9eb8ad5-1773429126351.png"
  },
  {
    id: 'myanmar',
    name: 'Myanmar Civil War',
    region: 'Southeast Asia',
    status: 'active',
    startedUnderTrump: false,
    trumpClaimedCredit: false,
    description: 'Military junta vs resistance forces since 2021 coup. Trump administration has shown no engagement.',
    casualties: '50,000+',
    imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1ac4f9517-1765672629452.png"
  }];


  useEffect(() => {
    fetch('/api/news?section=wars').
    then((r) => r.json()).
    then((data) => {
      setLiveNews(data.items?.slice(0, 20) || []);
      setLoading(false);
    }).
    catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {if (e.isIntersecting) e.target.classList.add('active');}),
      { threshold: 0.06 }
    );
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const conflictsWithNews = conflicts.map((conflict) => {
    const related = liveNews.find((n) =>
    n.title.toLowerCase().includes(conflict.region.toLowerCase()) ||
    n.title.toLowerCase().includes(conflict.name.split(' ')[0].toLowerCase())
    );
    return { ...conflict, latestNews: related };
  });

  const trumpStartedCount = conflicts.filter((c) => c.startedUnderTrump).length;
  const trumpClaimedCount = conflicts.filter((c) => c.trumpClaimedCredit).length;
  const activeCount = conflicts.filter((c) => c.status === 'active' || c.status === 'escalating').length;

  return (
    <section
      id="wars"
      ref={sectionRef}
      className="py-24 bg-background border-t border-border overflow-hidden"
      aria-labelledby="wars-heading">
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-14 reveal">
          <div className="section-label mb-3">Section 03 · Global Conflicts</div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2
              id="wars-heading"
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-none tracking-tight">
              
              The <span className="text-war-red italic">Wars</span>
            </h2>
            <p className="text-muted max-w-sm text-sm leading-relaxed">
              Active global conflicts — with indicators for wars started during Trump's presidency and conflicts where Trump has claimed credit for "stopping."
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-12 reveal">
          {[
          { label: 'Active Conflicts', value: activeCount, color: 'var(--war-red)' },
          { label: 'Started Under Trump', value: trumpStartedCount, color: 'var(--primary)' },
          { label: 'Trump Claimed Credit', value: trumpClaimedCount, color: 'var(--credit-green)' }].
          map((stat) =>
          <div key={stat.label} className="text-center p-4 rounded-xl border border-border bg-card-bg">
              <div className="font-mono text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="font-mono text-[10px] text-muted tracking-widest uppercase mt-1">{stat.label}</div>
            </div>
          )}
        </div>

        {/* Conflict cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {conflictsWithNews.map((conflict, i) => {
            const statusCfg = STATUS_CONFIG[conflict.status];
            const isSelected = selectedConflict === conflict.id;
            return (
              <div
                key={conflict.id}
                className={`news-card reveal cursor-pointer overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''}`}
                style={{ transitionDelay: `${i * 80}ms` }}
                onClick={() => setSelectedConflict(isSelected ? null : conflict.id)}>
                
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <AppImage
                    src={conflict.imageUrl}
                    alt={`${conflict.name} conflict zone`}
                    fill
                    className="object-cover brightness-75" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono"
                  style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.color}40` }}>
                    <span className="w-1.5 h-1.5 rounded-full status-pulse" style={{ background: statusCfg.color }} />
                    {statusCfg.label.toUpperCase()}
                  </div>

                  {/* Started under Trump badge */}
                  {conflict.startedUnderTrump &&
                  <div className="absolute top-3 right-3 badge-trump-started px-2 py-0.5 rounded-full text-[9px] font-bold font-mono">
                      🦧 TRUMP ERA
                    </div>
                  }

                  {/* Region */}
                  <div className="absolute bottom-3 left-3 font-mono text-[10px] text-white/70 tracking-widest uppercase">
                    {conflict.region}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-display font-bold text-base leading-tight mb-1">{conflict.name}</h3>
                  <p className="text-muted text-xs leading-relaxed line-clamp-2 mb-3">{conflict.description}</p>

                  {/* Casualties */}
                  {conflict.casualties &&
                  <div className="flex items-center gap-1.5 mb-3">
                      <span className="font-mono text-[10px] text-muted">Est. casualties/impact:</span>
                      <span className="font-mono text-[10px] font-bold text-war-red">{conflict.casualties}</span>
                    </div>
                  }

                  {/* Trump credit claim */}
                  {conflict.trumpClaimedCredit ?
                  <div className="badge-claimed rounded-lg px-3 py-2 text-xs">
                      <div className="font-bold font-mono text-[10px] tracking-wide mb-1">🏆 TRUMP CLAIMED CREDIT</div>
                      <p className="text-xs leading-relaxed opacity-90 line-clamp-2">{conflict.trumpCreditQuote}</p>
                    </div> :

                  <div className="badge-ongoing rounded-lg px-3 py-1.5 text-xs font-mono font-semibold text-[10px] tracking-wide">
                      ⚔️ NO CREDIT CLAIMED — STILL ONGOING
                    </div>
                  }

                  {/* Latest news */}
                  {isSelected && conflict.latestNews &&
                  <a
                    href={conflict.latestNews.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block p-3 bg-background rounded-lg border border-border hover:border-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}>
                    
                      <div className="font-mono text-[9px] text-muted mb-1">{conflict.latestNews.source} · Latest</div>
                      <div className="font-display text-xs font-semibold leading-tight hover:text-primary transition-colors">
                        {conflict.latestNews.title}
                      </div>
                    </a>
                  }
                  {isSelected && !conflict.latestNews &&
                  <div className="mt-3 p-3 bg-background rounded-lg border border-border text-xs text-muted font-mono">
                      No live RSS match for this conflict at this time.
                    </div>
                  }

                  {/* Expand hint */}
                  <div className="mt-3 text-[10px] font-mono text-muted text-right">
                    {isSelected ? '▲ collapse' : '▼ latest news'}
                  </div>
                </div>
              </div>);

          })}
        </div>

        {/* Live news from wars feed */}
        {!loading && liveNews.length > 0 &&
        <div className="mt-12 reveal">
            <h3 className="font-display font-semibold text-lg mb-4">Live Conflict News Feed</h3>
            <div className="space-y-2">
              {liveNews.slice(0, 8).map((item, i) =>
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-3 rounded-lg border border-border bg-card-bg hover:border-primary transition-colors group">
              
                  <span className="font-mono text-[10px] text-muted w-20 flex-shrink-0 pt-0.5">
                    {new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="font-display text-sm font-medium leading-snug group-hover:text-primary transition-colors flex-1">
                    {item.title}
                  </span>
                  <span className="font-mono text-[9px] text-muted flex-shrink-0">{item.source}</span>
                </a>
            )}
            </div>
          </div>
        }
      </div>
    </section>);

}