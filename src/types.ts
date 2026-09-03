export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Movie {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: string;
  rating: number;
  overview: string;
}

export type RoomStatus = 'WAITING' | 'ACTIVE' | 'ENDED';

export interface Room {
  id: string;
  roomCode: string;
  hostId: string;
  movieId: number;
  movie?: Movie;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  user?: User;
  joinedAt: string;
}

export interface PlaybackState {
  id: string;
  roomId: string;
  currentTime: number;
  isPlaying: boolean;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  movieId: number;
  movie: Movie;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

export type AppView = 
  | 'home'
  | 'movies'
  | 'wishlist'
  | 'login'
  | 'register'
  | 'create-date'
  | 'waiting-room'
  | 'watch-room';
