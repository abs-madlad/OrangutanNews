'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      {/* Breaking news ticker */}
      <div className="bg-primary text-white text-xs py-1.5 overflow-hidden">
        <div className="ticker-track">
          {[
            '🦧 LIVE: Tracking all Trump presidency events in real-time',
            '⚡ Mishap Counter updating every hour based on aggregated data',
            '🌍 Global conflicts monitored 24/7 — Wars section updated continuously',
            '📰 RSS feeds from Reuters, BBC, AP, NY Times refreshed every 5 minutes',
            '🦧 LIVE: Tracking all Trump presidency events in real-time',
            '⚡ Mishap Counter updating every hour based on aggregated data',
            '🌍 Global conflicts monitored 24/7 — Wars section updated continuously',
            '📰 RSS feeds from Reuters, BBC, AP, NY Times refreshed every 5 minutes',
          ]?.map((text, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-8 font-mono text-xs tracking-wide whitespace-nowrap">
              {text}
              <span className="opacity-40 mx-2">◆</span>
            </span>
          ))}
        </div>
      </div>
      {/* Main nav */}
      <nav
        className={`transition-all duration-500 px-4 py-2 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/homepage" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-xl select-none">
              🦧
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-lg tracking-tight text-foreground">
                Orangutan<span className="text-primary">News</span>
              </span>
              <span className="font-mono text-[9px] text-muted tracking-widest uppercase">Unfiltered Reality</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#trump-daily" className="text-muted hover:text-primary transition-colors">Today's Chaos</a>
            <a href="#the-mess" className="text-muted hover:text-primary transition-colors">The Mess</a>
            <a href="#wars" className="text-muted hover:text-primary transition-colors">Wars</a>
            <a href="#counter" className="text-muted hover:text-primary transition-colors">Mishap Counter</a>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="hidden lg:block font-mono text-xs text-muted border border-border rounded px-2 py-1">
              {currentTime} EST
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-war-red">
              <span className="w-2 h-2 rounded-full bg-war-red status-pulse"></span>
              LIVE
            </span>
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 glass-card rounded-xl p-4 mx-2 shadow-xl">
            <nav className="flex flex-col gap-3 text-sm font-medium">
              <a href="#trump-daily" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Today's Chaos</a>
              <a href="#the-mess" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary transition-colors">The Mess</a>
              <a href="#wars" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Wars</a>
              <a href="#counter" onClick={() => setMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Mishap Counter</a>
            </nav>
          </div>
        )}
      </nav>
    </header>
  );
}