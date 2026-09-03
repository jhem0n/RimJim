import React from 'react';
import { Heart, KeyRound, MessageCircleHeart, Users2 } from 'lucide-react';

export const IntimateRitual: React.FC = () => {
  return (
    <section id="intimate-ritual-section" className="border-t border-neutral-900 bg-[#090a0e] py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold tracking-widest text-rose-400 uppercase">
            Designed For Two
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Not a streaming platform. <br className="hidden sm:inline" />
            <span className="italic text-rose-200">A shared evening together.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-neutral-400">
            Everything in RimJim is crafted around closeness, conversation, and an intimate cinema room for you and your person.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-6 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-950/40 text-rose-400 border border-rose-900/30">
              <Users2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-white">1. Two People</h3>
            <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
              No audience, no crowd, and no 3rd participant allowed. Just the two of you in your own private screening.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-6 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-950/40 text-rose-400 border border-rose-900/30">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-white">2. One Movie</h3>
            <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
              Browse together or pull from your shared wishlist. Pick something special and make it an occasion.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-6 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-950/40 text-rose-400 border border-rose-900/30">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-white">3. One Private Room</h3>
            <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
              Protected by your secret room password and random room code. Nobody else can enter or peek inside.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-6 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-950/40 text-rose-400 border border-rose-900/30">
              <MessageCircleHeart className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-white">4. One Shared Moment</h3>
            <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
              Synchronized play, pause, and seek with real-time room chat so you feel side-by-side on the sofa.
            </p>
          </div>
        </div>

        {/* Central Quote Callout */}
        <div className="mt-14 text-center">
          <div className="inline-block rounded-2xl border border-rose-900/30 bg-rose-950/20 px-8 py-5">
            <p className="font-serif text-lg italic text-rose-200">
              &ldquo;Two people. One movie. One private room. One shared moment.&rdquo; <span className="text-rose-500 font-normal">❤️</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
