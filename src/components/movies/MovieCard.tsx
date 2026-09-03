import React from 'react';
import { Heart, Star, Calendar, Film, ArrowRight } from 'lucide-react';
import { Movie } from '../../types';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onAddToWishlist?: (movie: Movie) => void;
  isWishlisted?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelect,
  onAddToWishlist,
  isWishlisted = false,
}) => {
  return (
    <div
      id={`movie-card-${movie.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-800/80 bg-[#12141c]/80 transition-all duration-300 hover:-translate-y-1 hover:border-rose-900/50 hover:shadow-xl hover:shadow-rose-950/20"
    >
      {/* Poster Image Container */}
      <div 
        onClick={() => onSelect(movie)}
        className="relative aspect-[2/3] w-full cursor-pointer overflow-hidden bg-neutral-900"
      >
        {movie.posterPath ? (
          <img
            src={movie.posterPath}
            alt={movie.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-neutral-500">
            <Film className="h-10 w-10 text-rose-500/40 mb-2" />
            <span className="text-xs text-center">{movie.title}</span>
          </div>
        )}

        {/* Subtle dark gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#12141c] via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Rating Badge */}
        {movie.rating > 0 && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md border border-neutral-800/60">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Wishlist Toggle Button on Poster */}
        {onAddToWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist(movie);
            }}
            className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-transform active:scale-90 ${
              isWishlisted
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950'
                : 'bg-black/60 text-neutral-300 hover:bg-rose-950/80 hover:text-rose-400 border border-neutral-800/60'
            }`}
            title={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
            aria-label={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>
        )}
      </div>

      {/* Info Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-neutral-500" />
            {movie.releaseYear || 'Date Night'}
          </span>
          <span className="text-rose-400/80 text-[10px] font-medium tracking-wide uppercase">
            TMDB ID: {movie.id}
          </span>
        </div>

        <h3
          onClick={() => onSelect(movie)}
          className="cursor-pointer font-serif text-base font-bold text-white transition-colors hover:text-rose-300 line-clamp-1"
          title={movie.title}
        >
          {movie.title}
        </h3>

        <p className="mt-1.5 text-xs text-neutral-400 line-clamp-2 leading-relaxed flex-1">
          {movie.overview}
        </p>

        {/* Primary Action Button */}
        <div className="mt-3 pt-3 border-t border-neutral-800/60">
          <button
            type="button"
            onClick={() => onSelect(movie)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-neutral-900/90 py-2 text-xs font-semibold text-rose-200 border border-neutral-800 transition-all hover:bg-rose-950/40 hover:border-rose-800/40 hover:text-white active:scale-98"
          >
            <span>View & Make a Date</span>
            <ArrowRight className="h-3.5 w-3.5 text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
