import React, { useState, useEffect, useRef } from 'react';
import { Search, Film, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { Movie } from '../../types';
import { api } from '../../lib/api';

interface MovieSearchProps {
  onSelectMovie: (movie: Movie) => void;
  onAddToWishlist: (movie: Movie) => void;
  wishlistIds: number[];
}

export const MovieSearch: React.FC<MovieSearchProps> = ({
  onSelectMovie,
  onAddToWishlist,
  wishlistIds,
}) => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMovies = async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.movies.search(searchQuery);
      setMovies(res.movies);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch movies.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load: fetch curated date-night recommendations
  useEffect(() => {
    fetchMovies('');
  }, []);

  // Handle query change with 400ms debounce
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchMovies(val);
    }, 350);
  };

  return (
    <section id="movie-search-section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header & Search Bar */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-900/30 bg-rose-950/20 px-3.5 py-1 text-xs font-medium text-rose-300">
          <Sparkles className="h-3.5 w-3.5 text-rose-400" />
          <span>TMDB Movie Catalog</span>
        </div>

        <h1 className="mt-4 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Find a Movie For Date Night
        </h1>

        <p className="mt-2 text-sm text-neutral-400">
          Search thousands of films or pick a romantic classic for your private room.
        </p>

        {/* Search Input */}
        <div className="mt-6 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-500">
            <Search className="h-5 w-5" />
          </div>
          <input
            id="movie-search-input"
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search for a movie (e.g. Before Sunrise, La La Land, Titanic)..."
            className="w-full rounded-2xl border border-neutral-800 bg-[#12141c] py-3.5 pl-11 pr-11 text-sm sm:text-base text-white placeholder-neutral-500 shadow-xl focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <Loader2 className="h-5 w-5 animate-spin text-rose-400" />
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mx-auto mt-6 max-w-md rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-center text-xs text-rose-200">
          <AlertCircle className="h-5 w-5 mx-auto mb-1 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Movies Grid */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
            {query.trim() ? `Search Results (${movies.length})` : 'Curated Date Night Classics'}
          </h2>
          <span className="text-xs text-neutral-500">
            Powered by TMDB
          </span>
        </div>

        {movies.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={onSelectMovie}
                onAddToWishlist={onAddToWishlist}
                isWishlisted={wishlistIds.includes(movie.id)}
              />
            ))}
          </div>
        ) : !loading ? (
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/20 py-16 text-center">
            <Film className="mx-auto h-12 w-12 text-neutral-600 mb-3" />
            <h3 className="font-serif text-lg font-medium text-neutral-300">
              No movies found for &ldquo;{query}&rdquo;
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Try searching with a different movie title or keyword.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
};
