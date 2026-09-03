import React from 'react';
import { Heart, Film, Play, Trash2, ArrowRight } from 'lucide-react';
import { Movie, WishlistItem } from '../../types';

interface WishlistViewProps {
  items: WishlistItem[];
  onSelectMovie: (movie: Movie) => void;
  onRemoveItem: (movieId: number) => void;
  onStartMovieDate: (movie: Movie) => void;
  onBrowseMovies: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  items,
  onSelectMovie,
  onRemoveItem,
  onStartMovieDate,
  onBrowseMovies,
}) => {
  return (
    <div id="wishlist-view" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-950/50 border border-rose-900/30 text-rose-400">
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Our Date Night Wishlist ❤️
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            {items.length === 0
              ? 'No movies saved yet. Save romantic titles to plan your next date.'
              : `${items.length} movie${items.length === 1 ? '' : 's'} saved for your private movie dates.`}
          </p>
        </div>

        <button
          onClick={onBrowseMovies}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-rose-950 transition-all hover:bg-rose-500 active:scale-98"
        >
          <span>Browse TMDB Catalog</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Wishlist Items Grid */}
      {items.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex overflow-hidden rounded-2xl border border-neutral-800 bg-[#12141c]/90 transition-all duration-300 hover:border-rose-900/40 hover:shadow-xl hover:shadow-rose-950/20"
            >
              {/* Poster Thumbnail */}
              <div 
                onClick={() => onSelectMovie(item.movie)}
                className="relative aspect-[2/3] w-28 shrink-0 cursor-pointer overflow-hidden bg-neutral-900"
              >
                {item.movie.posterPath ? (
                  <img
                    src={item.movie.posterPath}
                    alt={item.movie.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-neutral-600">
                    <Film className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* Info & Actions */}
              <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{item.movie.releaseYear || 'Date Night'}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.movieId)}
                      className="text-neutral-500 transition-colors hover:text-rose-400"
                      title="Remove from wishlist"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h3
                    onClick={() => onSelectMovie(item.movie)}
                    className="mt-1 cursor-pointer font-serif text-sm sm:text-base font-bold text-white transition-colors hover:text-rose-300 line-clamp-1"
                  >
                    {item.movie.title}
                  </h3>

                  <p className="mt-1 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {item.movie.overview}
                  </p>
                </div>

                {/* Direct Action: Start Date with this movie */}
                <div className="mt-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onStartMovieDate(item.movie)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-600/90 py-2 text-xs font-semibold text-white transition-all hover:bg-rose-500 active:scale-98"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Make It Our Movie Date</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="mt-12 rounded-3xl border border-dashed border-neutral-800 bg-[#0e1017]/40 py-16 px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-950/20 border border-rose-900/30 text-rose-400">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-serif text-xl font-medium text-white">
            Your Wishlist is Empty
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-xs text-neutral-400">
            Browse our curated romantic catalog or search for any film to build your date night collection.
          </p>
          <div className="mt-6">
            <button
              onClick={onBrowseMovies}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-950 transition-all hover:bg-rose-500"
            >
              <Film className="h-4 w-4" />
              <span>Explore Movies Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
