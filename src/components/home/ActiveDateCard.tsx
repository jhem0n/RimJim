import React from 'react';
import { Film, Play, ArrowRight, Heart, Sparkles, Clock } from 'lucide-react';
import { Room, AppView } from '../../types';

interface ActiveDateCardProps {
  activeRoom: Room | null;
  isAuthenticated: boolean;
  onNavigate: (view: AppView) => void;
  onContinueRoom: (roomCode: string) => void;
}

export const ActiveDateCard: React.FC<ActiveDateCardProps> = ({
  activeRoom,
  isAuthenticated,
  onNavigate,
  onContinueRoom,
}) => {
  if (!isAuthenticated) {
    return null;
  }

  return (
    <section id="active-date-section" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
      {activeRoom ? (
        /* Logged in with active movie date */
        <div 
          id="active-room-banner" 
          className="relative overflow-hidden rounded-2xl border border-rose-800/40 bg-gradient-to-r from-rose-950/40 via-neutral-900/80 to-neutral-950 p-6 sm:p-8 shadow-xl shadow-rose-950/20 backdrop-blur-md"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Movie Poster thumbnail */}
            <div className="relative h-44 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-rose-900/30 bg-neutral-800 shadow-md">
              {activeRoom.movie?.posterPath ? (
                <img
                  src={activeRoom.movie.posterPath}
                  alt={activeRoom.movie.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-neutral-900 text-neutral-500">
                  <Film className="h-8 w-8 text-rose-500/50" />
                  <span className="mt-1 text-[10px]">No Poster</span>
                </div>
              )}
              <div className="absolute top-2 right-2 rounded-full bg-rose-600/90 p-1 text-white shadow-xs">
                <Heart className="h-3 w-3 fill-white" />
              </div>
            </div>

            {/* Room Details & Copy */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-900/30 px-3 py-1 text-xs font-medium text-rose-300 border border-rose-800/30">
                <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                <span>Your Movie Date ❤️</span>
              </div>

              <h2 id="active-room-movie-title" className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
                {activeRoom.movie?.title || 'Selected Movie'}
              </h2>

              <p className="mt-1 text-sm text-rose-200/80">
                Your room is waiting for you.
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-neutral-500" />
                  Room Code: <strong className="font-mono text-neutral-200 tracking-wider uppercase">{activeRoom.roomCode}</strong>
                </span>
                <span className="rounded-full bg-neutral-800/80 px-2.5 py-0.5 text-rose-300 font-medium border border-neutral-700/50">
                  Status: {activeRoom.status}
                </span>
              </div>
            </div>

            {/* Continue CTA */}
            <div className="w-full md:w-auto flex-shrink-0">
              <button
                id="btn-continue-movie-date"
                onClick={() => onContinueRoom(activeRoom.roomCode)}
                className="flex h-12 w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 font-semibold text-white shadow-md shadow-rose-950 transition-all hover:bg-rose-500 hover:shadow-rose-900/50 active:scale-98"
              >
                <span>Continue Movie Date</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: No active date yet */
        <div 
          id="empty-date-state" 
          className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 p-8 sm:p-10 text-center backdrop-blur-xs"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-900/30 bg-rose-950/20 text-rose-400">
            <Film className="h-7 w-7" />
          </div>

          <h2 className="mt-4 font-serif text-xl font-semibold text-neutral-200 sm:text-2xl">
            No movie date yet.
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400 leading-relaxed">
            Pick a movie and make it your next date night. <span className="text-rose-500">❤️</span>
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              id="btn-empty-find-movie"
              onClick={() => onNavigate('movies')}
              className="flex h-11 items-center gap-2 rounded-xl bg-neutral-800 px-5 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-950/50 hover:text-white border border-neutral-700/60"
            >
              <Film className="h-4 w-4 text-rose-400" />
              <span>Find a Movie</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
