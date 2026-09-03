import React, { useState } from 'react';
import { X, Film, Lock, Heart, Play, Loader2, AlertCircle } from 'lucide-react';
import { Movie, Room } from '../../types';
import { api } from '../../lib/api';

interface CreateDateModalProps {
  movie: Movie | null;
  onClose: () => void;
  onRoomCreated: (room: Room) => void;
}

export const CreateDateModal: React.FC<CreateDateModalProps> = ({
  movie,
  onClose,
  onRoomCreated,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!movie) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Please set a secret password for your movie date.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.rooms.create(movie.id, password);
      onRoomCreated(res.room);
    } catch (err: any) {
      setError(err.message || 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="create-date-modal"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e1017] shadow-2xl transition-all p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-neutral-400 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center rounded-2xl bg-rose-950/40 p-3 text-rose-500 border border-rose-900/30">
            <Heart className="h-6 w-6 fill-rose-500 text-rose-500" />
          </div>
          <h2 className="mt-3 font-serif text-2xl font-bold text-white">
            Start Your Movie Date
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Lock in a private room for just the two of you.
          </p>
        </div>

        {/* Selected Movie Summary */}
        <div className="mt-5 flex items-center gap-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
          <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-950">
            {movie.posterPath ? (
              <img
                src={movie.posterPath}
                alt={movie.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-600">
                <Film className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-sm font-semibold text-white truncate">
              {movie.title}
            </h3>
            <p className="text-[11px] text-neutral-400">
              {movie.releaseYear || 'Date Night'} • TMDB #{movie.id}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="room-password" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Set Room Password (Required for your partner to join)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="room-password"
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. sweetheart or 1234"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
              Only people with this password can enter your room. Max 2 participants strictly enforced.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white shadow-md shadow-rose-950 transition-all hover:bg-rose-500 active:scale-98 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating Private Room...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Create & Get Invitation Link</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
