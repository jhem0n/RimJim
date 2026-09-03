import React, { useState, useEffect } from 'react';
import { Lock, Heart, Film, ArrowRight, Loader2, AlertCircle, X, Users } from 'lucide-react';
import { Room } from '../../types';
import { api } from '../../lib/api';

interface JoinRoomModalProps {
  initialRoomCode?: string;
  onClose: () => void;
  onJoined: (room: Room) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  initialRoomCode = '',
  onClose,
  onJoined,
}) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomPreview, setRoomPreview] = useState<(Room & { participantCount: number; isFull: boolean }) | null>(null);

  // If initial room code is provided, fetch preview info
  useEffect(() => {
    if (initialRoomCode) {
      setFetchingInfo(true);
      api.rooms.getInfo(initialRoomCode)
        .then((res) => {
          setRoomPreview(res.room);
        })
        .catch((err) => {
          setError(err.message || 'Room not found or no longer active.');
        })
        .finally(() => setFetchingInfo(false));
    }
  }, [initialRoomCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = roomCode.trim().toUpperCase();
    if (!code) {
      setError('Please enter the room code.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.rooms.join(code, password);
      onJoined(res.room);
    } catch (err: any) {
      setError(err.message || 'Failed to join room. Please check the code and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="join-room-modal"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e1017] p-6 sm:p-8 shadow-2xl transition-all"
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
            Join Your Movie Date
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Enter the secret password provided by your date to unlock the theater.
          </p>
        </div>

        {/* Movie Preview if found */}
        {fetchingInfo ? (
          <div className="mt-5 flex items-center justify-center py-4 text-xs text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin text-rose-400 mr-2" />
            Loading date details...
          </div>
        ) : roomPreview ? (
          <div className="mt-5 flex items-center gap-3.5 rounded-xl border border-rose-950/50 bg-rose-950/20 p-3">
            <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-950">
              {roomPreview.movie?.posterPath ? (
                <img
                  src={roomPreview.movie.posterPath}
                  alt={roomPreview.movie.title}
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
              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
                Invited Date Night
              </span>
              <h3 className="font-serif text-sm font-semibold text-white truncate">
                {roomPreview.movie?.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
                <Users className="h-3 w-3 text-rose-300" />
                <span>{roomPreview.participantCount} / 2 in room</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="join-room-code" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Room Code
            </label>
            <input
              id="join-room-code"
              type="text"
              required
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. RJ-AB12C"
              className="w-full uppercase tracking-wider font-mono rounded-xl border border-neutral-800 bg-neutral-900/90 py-2.5 px-3.5 text-sm text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="join-room-password" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Room Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="join-room-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white shadow-md shadow-rose-950 transition-all hover:bg-rose-500 active:scale-98 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Unlocking Theater...</span>
              </>
            ) : (
              <>
                <span>Enter Movie Date</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
