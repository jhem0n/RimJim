import React from 'react';
import { X, Heart, Film, Star, Calendar, Play, Check } from 'lucide-react';
import { Movie } from '../../types';

interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  onMakeMovieDate: (movie: Movie) => void;
  onToggleWishlist: (movie: Movie) => void;
  isWishlisted: boolean;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onMakeMovieDate,
  onToggleWishlist,
  isWishlisted,
}) => {
  if (!movie) return null;

  return (
    <div
      id="movie-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-details-title"
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e1017] shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop Header */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-neutral-900">
          {movie.backdropPath ? (
            <img
              src={movie.backdropPath}
              alt={movie.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : movie.posterPath ? (
            <img
              src={movie.posterPath}
              alt={movie.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover blur-sm opacity-60"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-950">
              <Film className="h-16 w-16 text-rose-500/30" />
            </div>
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-[#0e1017]/40 to-black/60" />

          {/* Close Button */}
          <button
            id="btn-close-details"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-neutral-300 backdrop-blur-md transition-colors hover:bg-neutral-800 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Badge overlays */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="flex items-center gap-2">
              {movie.rating > 0 && (
                <div className="flex items-center gap-1 rounded-lg bg-black/80 px-2.5 py-1 text-xs font-bold text-amber-300 border border-neutral-800 backdrop-blur-md">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{movie.rating.toFixed(1)} / 10</span>
                </div>
              )}
              <span className="flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-neutral-300 border border-neutral-800 backdrop-blur-md">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                <span>{movie.releaseYear || 'N/A'}</span>
              </span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 bg-black/60 px-2 py-0.5 rounded border border-neutral-800">
              TMDB #{movie.id}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          <h2
            id="movie-details-title"
            className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight"
          >
            {movie.title}
          </h2>

          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Synopsis
            </h3>
            <p className="mt-2 text-sm text-neutral-300 leading-relaxed max-h-40 overflow-y-auto pr-2">
              {movie.overview || 'No synopsis available for this selection.'}
            </p>
          </div>

          {/* Two Primary Actions as specified in Section 11 */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-neutral-800">
            {/* Primary Action: Make It Our Movie Date */}
            <button
              id="btn-make-our-movie-date"
              onClick={() => onMakeMovieDate(movie)}
              className="flex h-12 w-full sm:flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 font-semibold text-white shadow-md shadow-rose-950 transition-all hover:bg-rose-500 hover:shadow-rose-900/50 active:scale-98"
            >
              <span>Make It Our Movie Date ❤️</span>
              <Play className="h-4 w-4 fill-white" />
            </button>

            {/* Secondary Action: Add to Wishlist */}
            <button
              id="btn-toggle-wishlist"
              onClick={() => onToggleWishlist(movie)}
              className={`flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium border transition-all active:scale-98 ${
                isWishlisted
                  ? 'bg-rose-950/40 text-rose-300 border-rose-800 hover:bg-rose-900/50'
                  : 'bg-neutral-900 text-neutral-200 border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {isWishlisted ? (
                <>
                  <Check className="h-4 w-4 text-rose-400" />
                  <span>In Wishlist</span>
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 text-rose-400" />
                  <span>Add to Wishlist ❤️</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
