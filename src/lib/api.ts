import { User, Movie, Room, WishlistItem, PlaybackState, ChatMessage } from '../types';

const TOKEN_KEY = 'rimjim_token';
const USER_KEY = 'rimjim_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || (response.status === 401 ? 'Please login to continue.' : 'Something went wrong. Please try again.');
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    async register(username: string, email: string, password: string, confirmPassword: string) {
      const res = await request<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });
      setStoredAuth(res.token, res.user);
      return res;
    },

    async login(email: string, password: string) {
      const res = await request<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setStoredAuth(res.token, res.user);
      return res;
    },

    async me() {
      return request<{ user: User }>('/api/auth/me');
    },

    async logout() {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } finally {
        clearStoredAuth();
      }
    },
  },

  movies: {
    async search(query: string) {
      return request<{ movies: Movie[] }>(`/api/movies/search?q=${encodeURIComponent(query)}`);
    },
    async getDetails(id: number) {
      return request<{ movie: Movie }>(`/api/movies/${id}`);
    },
  },

  wishlist: {
    async getAll() {
      return request<{ items: WishlistItem[] }>('/api/wishlist');
    },
    async add(movieId: number, movie?: Movie) {
      return request<{ item: WishlistItem }>('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ movieId, movie }),
      });
    },
    async remove(movieId: number) {
      return request<{ success: boolean }>(`/api/wishlist/${movieId}`, {
        method: 'DELETE',
      });
    },
  },

  rooms: {
    async getActive() {
      return request<{ room: Room | null }>('/api/rooms/user/active');
    },
    async create(movieId: number, password: string) {
      return request<{ room: Room }>('/api/rooms', {
        method: 'POST',
        body: JSON.stringify({ movieId, password }),
      });
    },
    async getInfo(roomCode: string) {
      return request<{ room: Room & { participantCount: number; isFull: boolean } }>(`/api/rooms/${roomCode}`);
    },
    async join(roomCode: string, password?: string) {
      return request<{ success: boolean; room: Room }>(`/api/rooms/${roomCode}/join`, {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
    },
    async getState(roomCode: string) {
      return request<{
        room: Room;
        participants: Array<{ id: string; userId: string; username: string; joinedAt: string }>;
        playbackState: PlaybackState;
        messages: ChatMessage[];
      }>(`/api/rooms/${roomCode}/state`);
    },
    async updatePlayback(roomCode: string, currentTime: number, isPlaying: boolean) {
      return request<{ playbackState: PlaybackState }>(`/api/rooms/${roomCode}/playback`, {
        method: 'POST',
        body: JSON.stringify({ currentTime, isPlaying }),
      });
    },
    async sendChat(roomCode: string, message: string) {
      return request<{ message: ChatMessage }>(`/api/rooms/${roomCode}/chat`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
  },
};
