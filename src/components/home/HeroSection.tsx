import React from 'react';
import { Film, Heart, Sparkles, Shield, Play } from 'lucide-react';
import { AppView } from '../../types';

interface HeroSectionProps {
  onNavigate: (view: AppView) => void;
  isAuthenticated: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, isAuthenticated }) => {
  return (
    <section id="hero-section" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Subtle cinematic ambient glow - restrained, non-distracting */}
      <div 
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-rose-950/20 blur-[120px]" 
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute top-1/2 right-10 -z-10 h-72 w-72 rounded-full bg-amber-950/10 blur-[100px]" 
        aria-hidden="true" 
      />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Subtle romantic brand eyebrow pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-900/40 bg-rose-950/30 px-4 py-1.5 text-xs font-medium text-rose-300 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
          <span>Private 2-Person Virtual Cinema</span>
          <span className="text-rose-400">❤️</span>
        </div>

        {/* Cinematic Title & Exact Prompt Copy */}
        <h1 
          id="hero-main-title" 
          className="mt-8 font-serif text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.12]"
        >
          Movie dates, even when <br className="hidden sm:inline" />
          <span className="italic text-rose-200">you&apos;re miles apart.</span>
        </h1>

        <p 
          id="hero-subtitle" 
          className="mx-auto mt-6 max-w-2xl text-lg font-light text-neutral-300 sm:text-xl leading-relaxed"
        >
          Pick a movie. Invite your person. Make it a date. <span className="text-rose-500">❤️</span>
        </p>

        {/* Primary and Secondary Call To Actions */}
        <div id="hero-actions-group" className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <button
            id="hero-btn-movie-date"
            onClick={() => onNavigate(isAuthenticated ? 'movies' : 'login')}
            className="group flex h-13 w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-rose-600 px-7 text-base font-semibold text-white shadow-lg shadow-rose-950/60 transition-all hover:bg-rose-500 hover:shadow-rose-900/50 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <span>Go on a Movie Date 🎬</span>
            <Play className="h-4 w-4 fill-white transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            id="hero-btn-wishlist"
            onClick={() => onNavigate(isAuthenticated ? 'wishlist' : 'login')}
            className="flex h-13 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-neutral-700/80 bg-neutral-900/80 px-7 text-base font-medium text-neutral-200 shadow-sm backdrop-blur-sm transition-all hover:border-rose-800/60 hover:bg-neutral-800/90 hover:text-white active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            <span>Wishlist ❤️</span>
          </button>
        </div>

        {/* Intimate Value Pillars (Strictly for Two, No Public Social noise) */}
        <div className="mt-14 pt-8 border-t border-neutral-800/60 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="rounded-xl border border-neutral-800/70 bg-neutral-900/40 p-4.5 backdrop-blur-xs">
            <div className="flex items-center gap-2.5 text-rose-400 mb-1.5">
              <Shield className="h-4 w-4" />
              <h2 className="text-sm font-semibold text-neutral-200">Strictly 2 People</h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Every room is capped at exactly host + partner. Password-protected and strictly private.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800/70 bg-neutral-900/40 p-4.5 backdrop-blur-xs">
            <div className="flex items-center gap-2.5 text-rose-400 mb-1.5">
              <Film className="h-4 w-4" />
              <h2 className="text-sm font-semibold text-neutral-200">Synchronized Playback</h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              When one plays, pauses, or seeks, both stay in sync with automatic drift correction.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800/70 bg-neutral-900/40 p-4.5 backdrop-blur-xs">
            <div className="flex items-center gap-2.5 text-rose-400 mb-1.5">
              <Sparkles className="h-4 w-4" />
              <h2 className="text-sm font-semibold text-neutral-200">Private Date Chat</h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Share real-time reactions and moments right alongside the screen as you watch together.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
