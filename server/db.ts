import fs from 'fs';
import path from 'path';

export interface DBUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBRoom {
  id: string;
  roomCode: string;
  hostId: string;
  movieId: number;
  movieMetadata: {
    id: number;
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    releaseYear: string;
    rating: number;
    overview: string;
  };
  passwordHash: string;
  salt: string;
  status: 'WAITING' | 'ACTIVE' | 'ENDED';
  createdAt: string;
  updatedAt: string;
}

export interface DBRoomParticipant {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  joinedAt: string;
}

export interface DBPlaybackState {
  id: string;
  roomId: string;
  currentTime: number;
  isPlaying: boolean;
  updatedAt: string;
}

export interface DBWishlist {
  id: string;
  userId: string;
  movieId: number;
  movie: any;
  createdAt: string;
}

export interface DBChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

export interface DBSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

interface DatabaseSchema {
  users: DBUser[];
  rooms: DBRoom[];
  participants: DBRoomParticipant[];
  playbackStates: DBPlaybackState[];
  wishlists: DBWishlist[];
  messages: DBChatMessage[];
  sessions: DBSession[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'rimjim_db.json');

class RimJimDatabase {
  private data: DatabaseSchema = {
    users: [],
    rooms: [],
    participants: [],
    playbackStates: [],
    wishlists: [],
    messages: [],
    sessions: [],
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Failed to load database from file, initializing empty store:', err);
    }
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  // --- Users ---
  findUserByEmail(email: string): DBUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  findUserByUsername(username: string): DBUser | undefined {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
  }

  findUserById(id: string): DBUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: DBUser): DBUser {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // --- Sessions ---
  createSession(token: string, userId: string): DBSession {
    const session: DBSession = {
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  findSession(token: string): DBSession | undefined {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt) < new Date()) {
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.save();
  }

  // --- Rooms ---
  findRoomByCode(roomCode: string): DBRoom | undefined {
    return this.data.rooms.find(r => r.roomCode.toUpperCase() === roomCode.toUpperCase().trim());
  }

  findRoomById(id: string): DBRoom | undefined {
    return this.data.rooms.find(r => r.id === id);
  }

  findActiveRoomForUser(userId: string): DBRoom | undefined {
    // Find room where user is host or participant and status is not ENDED
    const participantRoomIds = this.data.participants
      .filter(p => p.userId === userId)
      .map(p => p.roomId);
    
    return this.data.rooms.find(
      r => (r.hostId === userId || participantRoomIds.includes(r.id)) && r.status !== 'ENDED'
    );
  }

  createRoom(room: DBRoom): DBRoom {
    this.data.rooms.push(room);
    this.save();
    return room;
  }

  updateRoom(id: string, updates: Partial<DBRoom>): DBRoom | undefined {
    const room = this.findRoomById(id);
    if (!room) return undefined;
    Object.assign(room, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return room;
  }

  // --- Participants (2 people max constraint) ---
  getRoomParticipants(roomId: string): DBRoomParticipant[] {
    return this.data.participants.filter(p => p.roomId === roomId);
  }

  addRoomParticipant(roomId: string, userId: string, username: string): DBRoomParticipant | null {
    const currentParticipants = this.getRoomParticipants(roomId);
    const existing = currentParticipants.find(p => p.userId === userId);
    if (existing) return existing;

    // Strict 2 participants limit check (Host + Partner)
    if (currentParticipants.length >= 2) {
      return null;
    }

    const participant: DBRoomParticipant = {
      id: 'part_' + Math.random().toString(36).substring(2, 9),
      roomId,
      userId,
      username,
      joinedAt: new Date().toISOString(),
    };
    this.data.participants.push(participant);
    this.save();
    return participant;
  }

  removeRoomParticipant(roomId: string, userId: string): void {
    this.data.participants = this.data.participants.filter(
      p => !(p.roomId === roomId && p.userId === userId)
    );
    this.save();
  }

  // --- Playback State ---
  getPlaybackState(roomId: string): DBPlaybackState | undefined {
    return this.data.playbackStates.find(ps => ps.roomId === roomId);
  }

  setPlaybackState(roomId: string, currentTime: number, isPlaying: boolean): DBPlaybackState {
    let state = this.data.playbackStates.find(ps => ps.roomId === roomId);
    if (!state) {
      state = {
        id: 'play_' + Math.random().toString(36).substring(2, 9),
        roomId,
        currentTime,
        isPlaying,
        updatedAt: new Date().toISOString(),
      };
      this.data.playbackStates.push(state);
    } else {
      state.currentTime = currentTime;
      state.isPlaying = isPlaying;
      state.updatedAt = new Date().toISOString();
    }
    this.save();
    return state;
  }

  // --- Wishlist ---
  getUserWishlist(userId: string): DBWishlist[] {
    return this.data.wishlists.filter(w => w.userId === userId);
  }

  addToWishlist(userId: string, movieId: number, movie: any): DBWishlist | null {
    const exists = this.data.wishlists.some(w => w.userId === userId && w.movieId === movieId);
    if (exists) return null; // Prevent duplicates

    const item: DBWishlist = {
      id: 'wish_' + Math.random().toString(36).substring(2, 9),
      userId,
      movieId,
      movie,
      createdAt: new Date().toISOString(),
    };
    this.data.wishlists.push(item);
    this.save();
    return item;
  }

  removeFromWishlist(userId: string, movieId: number): boolean {
    const initialLen = this.data.wishlists.length;
    this.data.wishlists = this.data.wishlists.filter(
      w => !(w.userId === userId && w.movieId === movieId)
    );
    const removed = this.data.wishlists.length < initialLen;
    if (removed) this.save();
    return removed;
  }

  // --- Chat Messages ---
  getRoomMessages(roomId: string): DBChatMessage[] {
    return this.data.messages.filter(m => m.roomId === roomId);
  }

  addMessage(roomId: string, userId: string, username: string, message: string): DBChatMessage {
    const msg: DBChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      roomId,
      userId,
      username,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };
    this.data.messages.push(msg);
    this.save();
    return msg;
  }
}

export const db = new RimJimDatabase();
