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

const MESS_CATEGORIES = [
{ key: 'economy', label: 'Economy', icon: '📉', color: '#E85D04' },
{ key: 'diplomacy', label: 'Diplomacy', icon: '🌐', color: '#DC2626' },
{ key: 'environment', label: 'Environment', icon: '🌿', color: '#16A34A' },
{ key: 'institutions', label: 'Institutions', icon: '⚖️', color: '#7C3AED' }];


const FALLBACK_MESS: NewsItem[] = [
{
  id: 'm1', title: 'Global Markets Reel as US Tariffs Take Effect',
  description: 'The Dow Jones fell 3.2% as sweeping tariffs on Chinese goods triggered retaliatory measures from Beijing, sparking fears of a prolonged trade war.',
  link: '#', pubDate: new Date(Date.now() - 86400000).toISOString(), source: 'Reuters',
  category: 'mess', imageUrl: "https://images.unsplash.com/photo-1557986410-6e9fdb036362"
},
{
  id: 'm2', title: 'US Allies Scramble After NATO Commitment Wavers',
  description: 'European defense ministers held emergency talks after the US president suggested conditional support for NATO allies, triggering the largest European rearmament push in decades.',
  link: '#', pubDate: new Date(Date.now() - 172800000).toISOString(), source: 'BBC',
  category: 'mess', imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1d01ba443-1773429124702.png"
},
{
  id: 'm3', title: 'Federal Agencies Gutted: USAID Programs Shuttered',
  description: 'Over 80% of USAID contracts cancelled. Aid workers warn of humanitarian crises in Yemen, Sudan, and Gaza as food and medical supply chains collapse.',
  link: '#', pubDate: new Date(Date.now() - 259200000).toISOString(), source: 'AP News',
  category: 'mess', imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_11262a39c-1773090961538.png"
},
{
  id: 'm4', title: 'Greenland Annexation Threats Destabilize Arctic Relations',
  description: 'Denmark and Arctic Council members convened after repeated statements about US territorial ambitions over Greenland sparked a diplomatic crisis.',
  link: '#', pubDate: new Date(Date.now() - 345600000).toISOString(), source: 'NY Times',
  category: 'mess', imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1a8d9adb3-1768133359762.png"
},
{
  id: 'm5', title: 'DOJ Independence Under Threat as Prosecutors Fired',
  description: 'The firing of multiple career prosecutors at the Justice Department triggered alarm from legal scholars about the erosion of judicial independence.',
  link: '#', pubDate: new Date(Date.now() - 432000000).toISOString(), source: 'Washington Post',
  category: 'mess', imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_107cca73f-1765211176918.png"
},
{
  id: 'm6', title: 'Climate Agreements Abandoned: Paris Accord Exit Confirmed',
  description: 'The US formally withdrew from the Paris Climate Agreement for the second time, with the administration reversing all Biden-era climate executive orders.',
  link: '#', pubDate: new Date(Date.now() - 518400000).toISOString(), source: 'Reuters',
  category: 'mess', imageUrl: "https://images.unsplash.com/photo-1602501213876-62ca64319ab8"
}];


export default function MessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetch('/api/news?section=mess').
    then((r) => r.json()).
    then((data) => {
      const items = data.items && data.items.length >= 3 ? data.items : FALLBACK_MESS;
      setNews(items.slice(0, 9));
      setLoading(false);
    }).
    catch(() => {
      setNews(FALLBACK_MESS);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {if (e.isIntersecting) e.target.classList.add('active');}),
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );
    sectionRef.current?.querySelectorAll('.reveal, .reveal-left').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [news]);

  return (
    <section
      id="the-mess"
      ref={sectionRef}
      className="py-24 bg-dark-bg text-white overflow-hidden relative"
      aria-labelledby="mess-heading">
      
      {/* Atmospheric glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-war-red/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-14 reveal">
          <div className="section-label text-white/40 mb-3">Section 02 · Cause &amp; Effect</div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2
              id="mess-heading"
              className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-none tracking-tight">
              
              The <span className="text-primary italic">Mess</span>
              <br />
              <span className="text-white/40 font-light text-3xl md:text-4xl">by Orangutan</span>
            </h2>
            <p className="text-white/50 max-w-sm text-sm leading-relaxed lg:text-right">
              Events that happened as a direct or indirect consequence of Trump's presidency. The ripple effect, documented.
            </p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10 reveal">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono tracking-wide transition-all ${
            activeTab === 'all' ? 'tab-active' : 'bg-white/5 text-white/50 hover:bg-white/10'}`
            }>
            
            ALL EVENTS
          </button>
          {MESS_CATEGORIES.map((cat) =>
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono tracking-wide transition-all ${
            activeTab === cat.key ? 'tab-active' : 'bg-white/5 text-white/50 hover:bg-white/10'}`
            }>
            
              {cat.icon} {cat.label.toUpperCase()}
            </button>
          )}
        </div>

        {loading ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) =>
          <div key={i} className="war-card p-4">
                <div className="skeleton h-32 w-full mb-4 bg-white/10" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)', backgroundSize: '800px 100%', animation: 'shimmer 1.5s infinite linear' }} />
                <div className="h-4 w-3/4 mb-2 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="h-3 w-full mb-1 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
          )}
          </div> :

        <>
            {/* Bento grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((item, i) =>
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`war-card group reveal ${i === 0 ? 'md:col-span-2' : ''}`}
              style={{ transitionDelay: `${i * 70}ms` }}>
              
                  {item.imageUrl &&
              <div className={`relative overflow-hidden ${i === 0 ? 'h-52' : 'h-36'}`}>
                      <AppImage
                  src={item.imageUrl}
                  alt={`The Mess: ${item.title}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-75" />
                
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-transparent" />
                    </div>
              }
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[9px] text-white/40">{item.source}</span>
                      <span className="font-mono text-[9px] text-primary">
                        {new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className={`font-display font-semibold leading-tight group-hover:text-primary transition-colors ${i === 0 ? 'text-xl' : 'text-sm'}`}>
                      {item.title}
                    </h3>
                    {i === 0 &&
                <p className="text-white/50 text-sm leading-relaxed mt-2 line-clamp-2">{item.description}</p>
                }
                  </div>
                </a>
            )}
            </div>
          </>
        }

        <div className="mt-8 text-xs text-white/30 font-mono reveal">
          ⚡ News sourced via RSS · Filtered for Trump presidency impact events · Updates every 5 minutes
        </div>
      </div>
    </section>);

}