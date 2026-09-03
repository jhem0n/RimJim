import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, 
  Heart, MessageCircle, Users, Send, Film, 
  Smile, Shield, AlertCircle, LogOut, Check
} from 'lucide-react';
import { Room, PlaybackState, ChatMessage, User } from '../../types';
import { api } from '../../lib/api';

interface WatchRoomProps {
  room: Room;
  currentUser: User;
  onLeaveRoom: () => void;
}

// Sample romantic cinematic open video stream
const DEFAULT_SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';

export const WatchRoom: React.FC<WatchRoomProps> = ({
  room,
  currentUser,
  onLeaveRoom,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Video State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [videoSrc, setVideoSrc] = useState(DEFAULT_SAMPLE_VIDEO);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlEditor, setShowUrlEditor] = useState(false);

  // Sync & Room State
  const [participants, setParticipants] = useState<Array<{ id: string; userId: string; username: string }>>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'updating'>('synced');

  // Prevent local events from echoing server updates in a loop
  const isServerUpdatingRef = useRef(false);
  const lastPlaybackSyncRef = useRef<{ time: number; isPlaying: boolean }>({ time: 0, isPlaying: false });

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Poll room state: participants, playback sync, and chat messages
  const pollRoomState = useCallback(async () => {
    try {
      const res = await api.rooms.getState(room.roomCode);
      setParticipants(res.participants);
      setMessages(res.messages);

      const serverState = res.playbackState;
      const video = videoRef.current;

      if (!video) return;

      // Check if server playback state diverges from local state
      const timeDiff = Math.abs(video.currentTime - serverState.currentTime);
      const playStateDiff = !video.paused !== serverState.isPlaying;

      if (timeDiff > 2.5 || playStateDiff) {
        isServerUpdatingRef.current = true;
        setSyncStatus('updating');

        if (timeDiff > 2.5) {
          video.currentTime = serverState.currentTime;
          setCurrentTime(serverState.currentTime);
        }

        if (serverState.isPlaying && video.paused) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else if (!serverState.isPlaying && !video.paused) {
          video.pause();
          setIsPlaying(false);
        }

        setTimeout(() => {
          isServerUpdatingRef.current = false;
          setSyncStatus('synced');
        }, 500);
      }
    } catch (err) {
      console.error('Playback poll error:', err);
    }
  }, [room.roomCode]);

  useEffect(() => {
    pollRoomState();
    const interval = setInterval(pollRoomState, 1500);
    return () => clearInterval(interval);
  }, [pollRoomState]);

  // Push playback update to server
  const broadcastPlayback = async (newTime: number, newPlaying: boolean) => {
    if (isServerUpdatingRef.current) return;
    lastPlaybackSyncRef.current = { time: newTime, isPlaying: newPlaying };
    try {
      await api.rooms.updatePlayback(room.roomCode, newTime, newPlaying);
    } catch (err) {
      console.error('Failed to sync playback with server:', err);
    }
  };

  // Video Event Handlers
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        broadcastPlayback(video.currentTime, true);
      }).catch((e) => console.error('Play error', e));
    } else {
      video.pause();
      setIsPlaying(false);
      broadcastPlayback(video.currentTime, false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const target = parseFloat(e.target.value);
    video.currentTime = target;
    setCurrentTime(target);
    broadcastPlayback(target, isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Chat handling
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text || sendingChat) return;

    try {
      setSendingChat(true);
      setChatInput('');
      const res = await api.rooms.sendChat(room.roomCode, text);
      setMessages((prev) => [...prev, res.message]);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingChat(false);
    }
  };

  const handleSendReaction = (emoji: string) => {
    setChatInput(emoji);
    api.rooms.sendChat(room.roomCode, emoji).then((res) => {
      setMessages((prev) => [...prev, res.message]);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  };

  // Scroll chat on load or when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const partner = participants.find((p) => p.userId !== currentUser.id);

  return (
    <div id="watch-room-container" className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#07080b]">
      {/* Top Date Header */}
      <header className="border-b border-neutral-800/80 bg-[#0d0f16]/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Movie Title & Code */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-950/40 text-rose-400 border border-rose-900/30">
              <Film className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-sm sm:text-base font-bold text-white line-clamp-1">
                  {room.movie?.title || 'Our Movie Date'}
                </h1>
                <span className="hidden sm:inline-block rounded-md bg-neutral-800/80 px-2 py-0.5 font-mono text-[10px] text-rose-300">
                  {room.roomCode}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {room.movie?.releaseYear ? `${room.movie.releaseYear} • ` : ''}
                {syncStatus === 'updating' ? (
                  <span className="text-amber-400">Synchronizing with partner...</span>
                ) : (
                  <span className="text-emerald-400">● Perfectly Synchronized</span>
                )}
              </p>
            </div>
          </div>

          {/* Right Presence & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Couple Presence Tag */}
            <div className="flex items-center gap-2 rounded-xl bg-neutral-900/90 px-3 py-1.5 border border-neutral-800 text-xs">
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              <span className="text-neutral-300">
                {partner ? (
                  <span className="font-medium text-white">{partner.username} & You</span>
                ) : (
                  <span className="text-neutral-400">Waiting for partner...</span>
                )}
              </span>
            </div>

            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-rose-950/30 hover:border-rose-900/40 hover:text-rose-300 transition-colors"
              title="Leave Room"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Leave Room</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Screen: Cinema Player (Left) + Romantic Chat (Right) */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row gap-4 p-3 sm:p-4 lg:p-6">
        {/* Cinema Video Area */}
        <div className="flex flex-1 flex-col">
          <div
            ref={playerContainerRef}
            id="video-player-container"
            className="group relative flex aspect-video w-full flex-col justify-end overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800 bg-black shadow-2xl"
          >
            {/* Native Video Element */}
            <video
              ref={videoRef}
              src={videoSrc}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              playsInline
              className="h-full w-full object-contain cursor-pointer"
            />

            {/* Sync Overlay Indicator */}
            {syncStatus === 'updating' && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs text-amber-300 backdrop-blur-md border border-amber-500/20">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span>Aligning scene with partner...</span>
              </div>
            )}

            {/* Center Big Play Button (when paused) */}
            {!isPlaying && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 cursor-pointer backdrop-blur-[2px] transition-all"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-600/90 text-white shadow-2xl shadow-rose-950 transition-transform hover:scale-110 active:scale-95">
                  <Play className="h-7 w-7 fill-white translate-x-0.5" />
                </div>
              </div>
            )}

            {/* Custom Cinema Player Controls */}
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-opacity duration-300 group-hover:opacity-100 opacity-90 sm:opacity-0">
              {/* Progress Slider */}
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs text-neutral-300 min-w-[42px]">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.5"
                  value={currentTime}
                  onChange={handleSeek}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-neutral-700 accent-rose-500 focus:outline-none"
                />
                <span className="font-mono text-xs text-neutral-400 min-w-[42px]">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Lower Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-rose-600 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white translate-x-0.5" />}
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="text-neutral-300 hover:text-white"
                      aria-label="Toggle mute"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="h-1 w-16 sm:w-20 cursor-pointer appearance-none rounded-lg bg-neutral-700 accent-rose-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowUrlEditor(!showUrlEditor)}
                    className="text-xs text-neutral-400 hover:text-rose-300 transition-colors"
                    title="Change Video Stream URL"
                  >
                    Video Source
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-neutral-800 transition-colors"
                    aria-label="Toggle fullscreen"
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Optional Video Source Config for couples */}
          {showUrlEditor && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-neutral-800 bg-[#12141c] p-3 text-xs">
              <span className="text-neutral-400 shrink-0">Custom Video URL:</span>
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="Paste MP4 / WebM / Stream link..."
                className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={() => {
                  if (customUrlInput.trim()) {
                    setVideoSrc(customUrlInput.trim());
                    setShowUrlEditor(false);
                  }
                }}
                className="rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-white hover:bg-rose-500"
              >
                Set Stream
              </button>
            </div>
          )}

          {/* Under-player synopsis snippet */}
          <div className="mt-3 flex items-center justify-between rounded-xl border border-neutral-800/60 bg-[#10121a]/60 px-4 py-2.5 text-xs text-neutral-400">
            <span className="truncate pr-4">
              Now watching: <span className="text-white font-medium">{room.movie?.title}</span>
            </span>
            <span className="shrink-0 text-[11px] text-rose-400">
              Couples Cinema Mode
            </span>
          </div>
        </div>

        {/* Date Night Live Chat Column (Right) */}
        <div className="flex h-[450px] lg:h-auto lg:w-80 xl:w-96 flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-800 bg-[#0e1017]/90 shadow-xl backdrop-blur-xl">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/80 bg-neutral-900/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-rose-400" />
              <h2 className="font-serif text-sm font-bold text-white">
                Date Night Whispers ❤️
              </h2>
            </div>
            <span className="text-[11px] text-neutral-400">
              {messages.length} notes
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-4 text-neutral-500">
                <Heart className="h-8 w-8 text-rose-500/30 mb-2" />
                <p className="text-xs text-neutral-400">
                  Whisper sweet nothings, laugh together, or react to the scene.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.userId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-neutral-500 px-1 mb-0.5">
                      {isMe ? 'You' : msg.username}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words shadow-sm ${
                        isMe
                          ? 'bg-rose-600 text-white rounded-br-xs'
                          : 'bg-neutral-800 text-neutral-100 rounded-bl-xs border border-neutral-700/60'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Reaction Tray */}
          <div className="flex items-center justify-around border-t border-neutral-800/60 bg-neutral-900/20 px-2 py-1.5">
            {['❤️', '🍿', '🥺', '🥂', '😘', '🔥'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSendReaction(emoji)}
                className="rounded-lg p-1.5 text-sm hover:scale-125 transition-transform"
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendMessage} className="border-t border-neutral-800 p-3 bg-neutral-900/50 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send a whisper..."
              className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || sendingChat}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 transition-colors shrink-0"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
