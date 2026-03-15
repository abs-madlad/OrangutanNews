import Link from 'next/link';


export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      {/* Marquee */}
      <div className="overflow-hidden py-6 border-b border-border opacity-20 select-none">
        <div className="marquee-track">
          {Array.from({ length: 6 })?.map((_, i) => (
            <span key={i} className="font-display font-bold text-[8vw] leading-none tracking-tighter text-foreground whitespace-nowrap px-8">
              OrangutanNews · Unfiltered Reality ·&nbsp;
            </span>
          ))}
        </div>
      </div>
      {/* Links row */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦧</span>
          <span className="font-display font-bold text-base text-foreground">
            Orangutan<span className="text-primary">News</span>
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium text-muted">
          <Link href="/homepage" className="hover:text-foreground transition-colors">Home</Link>
          <a href="#trump-daily" className="hover:text-foreground transition-colors">Today</a>
          <a href="#wars" className="hover:text-foreground transition-colors">Wars</a>
          <a href="#counter" className="hover:text-foreground transition-colors">Counter</a>
          <Link href="/news-detail" className="hover:text-foreground transition-colors">Articles</Link>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted">
          <span>© 2026 OrangutanNews</span>
          <span className="opacity-40">·</span>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <span className="opacity-40">·</span>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
        </div>
      </div>
      <div className="text-center pb-4 text-xs text-muted opacity-50 font-mono">
        Satirical news portal. All content sourced from public RSS feeds. Not affiliated with any political party.
      </div>
    </footer>
  );
}