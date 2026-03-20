'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import TrumpDailySection from './components/TrumpDailySection';
import MessSection from './components/MessSection';
import WarsSection from './components/WarsSection';
import EpsteinSection from './components/EpsteinSection';
import MishapCounter from './components/MishapCounter';

export default function Homepage() {
  useEffect(() => {
    // Smooth scroll to sections
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSection />

        <section id="trump-daily" className="py-16">
          <TrumpDailySection />
        </section>

        <section id="mess" className="py-16 bg-card-bg">
          <MessSection />
        </section>

        <section id="wars" className="py-16">
          <WarsSection />
        </section>

        <section id="epstein" className="py-16 bg-card-bg">
          <EpsteinSection />
        </section>

        <section id="counter" className="py-16 bg-card-bg">
          <MishapCounter />
        </section>
      </main>

      <Footer />
    </div>
  );
}