import React, { useState, useEffect } from 'react';
import { Copy, Check, Heart, Film, Users, Loader2, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { Room } from '../../types';
import { api } from '../../lib/api';

interface WaitingRoomProps {
  room: Room;
  onPartnerJoined: () => void;
  onCancel: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  room,
  onPartnerJoined,
  onCancel,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(1);
  const [partnerName, setPartnerName] = useState<string | null>(null);

  const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${room.roomCode}`;

  const copyToClipboard = async (text: string, isCode: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isCode) {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  // Poll room state every 2 seconds to check if partner has entered
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await api.rooms.getState(room.roomCode);
        const count = res.participants.length;
        setParticipantsCount(count);

        const partner = res.participants.find((p) => p.userId !== room.hostId);
        if (partner) {
          setPartnerName(partner.username);
        }

        if (count >= 2 || res.room.status === 'ACTIVE') {
          setTimeout(() => {
            onPartnerJoined();
          }, 1000);
        }
      } catch (err) {
        console.error('Failed to poll room state:', err);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [room.roomCode, room.hostId, onPartnerJoined]);

  return (
    <div id="waiting-room-view" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="overflow-hidden rounded-3xl border border-rose-900/40 bg-[#0e1017]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Top Status Eyebrow */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-6">
          <div className="flex items-center gap-2 rounded-full bg-rose-950/40 px-3.5 py-1 text-xs font-medium text-rose-300 border border-rose-900/30">
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            <span>Your Movie Date is Ready ❤️</span>
          </div>

          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-300 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Leave Room</span>
          </button>
        </div>

        {/* Hero Copy */}
        <div className="mt-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {participantsCount >= 2 ? (
              <span className="text-rose-300 flex items-center justify-center gap-2">
                <span>{partnerName || 'Your Person'} Has Arrived!</span>
                <Heart className="h-7 w-7 fill-rose-500 text-rose-500 animate-bounce" />
              </span>
            ) : (
              <span>Waiting for your person to join...</span>
            )}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400">
            Share the invite link and your room password with your date. Once they enter, the theater unlocks automatically.
          </p>
        </div>

        {/* Movie Selected Display */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-5">
          <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-950 shadow-md">
            {room.movie?.posterPath ? (
              <img
                src={room.movie.posterPath}
                alt={room.movie.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-600">
                <Film className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
              Date Night Feature Film
            </span>
            <h2 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-white">
              {room.movie?.title || 'Selected Movie'}
            </h2>
            <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
              {room.movie?.overview}
            </p>
            <div className="mt-3 flex items-center justify-center sm:justify-start gap-3 text-xs text-neutral-400">
              <span>{room.movie?.releaseYear}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-rose-300">
                <Users className="h-3.5 w-3.5" />
                {participantsCount} / 2 Connected
              </span>
            </div>
          </div>
        </div>

        {/* Room Code & Invite Link Sharing Center */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Room Code Box */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 text-center">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Private Room Code
            </span>
            <div className="mt-2 font-mono text-3xl font-black text-rose-200 tracking-widest">
              {room.roomCode}
            </div>
            <button
              onClick={() => copyToClipboard(room.roomCode, true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-all active:scale-95"
            >
              {copiedCode ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Room Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Room Code</span>
                </>
              )}
            </button>
          </div>

          {/* Invite Link Box */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 text-center">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Shareable Date Link
            </span>
            <div className="mt-2 text-xs text-neutral-400 truncate px-2 font-mono">
              {inviteUrl}
            </div>
            <button
              onClick={() => copyToClipboard(inviteUrl, false)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-950 hover:bg-rose-500 transition-all active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>Link Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Invite Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-8 flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-950/40 px-4 py-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-rose-400" />
            <span>Strictly protected by your secret room password.</span>
          </div>
          {participantsCount < 2 ? (
            <div className="flex items-center gap-2 text-rose-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-[11px]">Listening for partner...</span>
            </div>
          ) : (
            <button
              onClick={onPartnerJoined}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              <span>Enter Theater Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
