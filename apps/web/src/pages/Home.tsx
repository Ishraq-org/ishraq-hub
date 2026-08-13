import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../components/icons';
import { Hero3D } from '../components/home/Hero3D';
import useT from '../hooks/useT';

export const Home: React.FC = () => {
  const { language } = useT();
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Fetch sponsors list
  const { data: sponsorData } = useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const res = await fetch('/api/sponsors');
      if (!res.ok) return { sponsors: [] };
      return res.json();
    },
  });

  const sponsors = sponsorData?.sponsors || [];

  return (
    <div className="flex-1 flex flex-col items-center w-full space-y-16 py-8 px-4 sm:px-6 lg:px-8 text-[var(--text-primary)]">
      {/* 1. Hero Section (Prompt 15 §48-59) */}
      <section className="w-full max-w-5xl mx-auto text-center space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--accent)] font-mono text-xs uppercase tracking-wider font-bold shadow-sm">
          <Icon name="zap" size={14} />
          <span>Multilingual Apologetics Engine</span>
        </div>

        {/* 3D Geometric Hero Element with Reduced Motion & Mobile Fallbacks */}
        <Hero3D />

        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            Illuminating Truth with Scholarly Rigor
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto">
            Ishraq Hub is an open, Wikipedia-style Islamic apologetics platform connecting manuscript evidence, biblical textual criticism, and theological refutations across English and Amharic.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to={`/${language}/topics`}
              className="px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-sm hover:opacity-90 transition-all shadow-md flex items-center gap-2"
            >
              <span>Explore Research & Topics</span>
              <Icon name="arrow-right" size={16} />
            </Link>
            <a
              href="#explainer"
              className="px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold text-sm hover:bg-[var(--bg-primary)] transition-colors"
            >
              What is Ishraq?
            </a>
          </div>
        </div>
      </section>

      {/* 2. Lazy-Loaded Click-to-Play Video Intro (Prompt 15 §60-63) */}
      <section className="w-full max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            Video Overview
          </span>
          <h2 className="text-2xl font-bold">Discover the Ishraq Knowledge System</h2>
        </div>

        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] shadow-xl flex items-center justify-center group">
          {isPlayingVideo ? (
            <iframe
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="Ishraq Hub Platform Overview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div
              onClick={() => setIsPlayingVideo(true)}
              className="relative w-full h-full bg-slate-900 flex flex-col items-center justify-center cursor-pointer select-none transition-transform group-hover:scale-[1.01]"
            >
              {/* Overlay Thumbnail Pattern */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 text-center space-y-3 p-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--accent)] text-[var(--bg-secondary)] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Icon name="play" size={28} className="ml-1" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-lg">Watch Platform Explainer (2 Min)</p>
                  <p className="text-xs text-slate-300">Click to play video • Zero tracking cookies</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Explainer Content Cards (Prompt 15 §64-67) */}
      <section id="explainer" className="w-full max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            Core Philosophy
          </span>
          <h2 className="text-3xl font-extrabold">Engineered for Academic Clarity</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3 shadow-sm hover:border-[var(--accent)]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center">
              <Icon name="link" size={20} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Connected Link Graph</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Every term, manuscript plate, and refutation is linked in a two-way knowledge graph, allowing seamless cross-referencing between articles.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3 shadow-sm hover:border-[var(--accent)]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-sky-950/40 text-sky-400 border border-sky-800/40 flex items-center justify-center">
              <Icon name="globe" size={20} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Bilingual First-Class</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Native English and Amharic translations with side-by-side language switching, built specifically for scholars and readers in East Africa and worldwide.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] space-y-3 shadow-sm hover:border-[var(--accent)]/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
              <Icon name="check-circle" size={20} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Rigorous Refutations</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Structured Shubha templates steelman opposing objections fairly, present core answers upfront, and cite primary manuscript plates.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Sponsor Section (Prompt 15 §68-70) */}
      {sponsors.length > 0 && (
        <section className="w-full max-w-4xl mx-auto space-y-6 pt-4 border-t border-[var(--border)] text-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Institutional Support
            </span>
            <h2 className="text-xl font-bold">Partners & Sponsors</h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            {sponsors.map((s: any) => (
              <a
                key={s._id}
                href={s.websiteUrl || '#'}
                target={s.websiteUrl ? '_blank' : '_self'}
                rel="noreferrer"
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-all flex flex-col items-center gap-2 shadow-sm group"
              >
                <img
                  src={s.logoUrl}
                  alt={s.name}
                  className="w-16 h-16 object-contain filter group-hover:brightness-110 transition-all"
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">{s.name}</span>
                <span className="text-[9px] uppercase tracking-wider font-mono text-[var(--accent)]">
                  {s.tier}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 5. Clear Primary Navigation CTA (Prompt 15 §70-71) */}
      <section className="w-full max-w-3xl mx-auto p-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] text-center space-y-4 shadow-lg">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ready to Dive into the Research?</h2>
        <p className="text-xs text-[var(--text-muted)] max-w-lg mx-auto">
          Browse our complete taxonomy of apologetics categories, Quranic manuscript studies, and refutations.
        </p>
        <Link
          to={`/${language}/topics`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-[var(--bg-secondary)] font-bold text-xs hover:opacity-90 transition-opacity shadow-md"
        >
          <span>Browse All Topics ({language.toUpperCase()})</span>
          <Icon name="arrow-right" size={14} />
        </Link>
      </section>
    </div>
  );
};

export default Home;
