import React from 'react';
import { Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="rimjim-footer" className="border-t border-neutral-800/80 bg-[#07080b] py-12 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand & Mission Statement */}
          <div className="text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-serif text-xl font-bold tracking-wider text-rose-100">
                RIMJIM
              </span>
              <span className="text-rose-500">❤️</span>
            </div>
            <p className="max-w-md text-xs text-neutral-400 leading-relaxed">
              A private virtual movie-date experience for couples who want to watch a movie together remotely. Designed with intimacy, simplicity, and romance.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[11px] text-neutral-500">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-400/70" />
              <span>Strictly 2 participants per room. End-to-end private.</span>
            </div>
          </div>

          {/* TMDB Official Attribution */}
          <div id="tmdb-attribution-badge" className="max-w-sm rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-center md:text-right backdrop-blur-xs">
            <div className="flex items-center justify-center md:justify-end gap-2 mb-1.5">
              <span className="rounded-md bg-gradient-to-r from-emerald-400 to-cyan-400 px-2 py-0.5 text-[10px] font-black text-neutral-950 uppercase tracking-wider">
                TMDB
              </span>
              <span className="text-xs font-medium text-neutral-300">Metadata Attribution</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-normal">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-neutral-900/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} RimJim. Pick a movie. Invite your person. Make it a date. ❤️</p>
          <div className="flex items-center gap-1">
            <span>Crafted for couples</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
