import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { hashPassword, verifyPassword, generateToken, generateRoomCode } from './server/auth.js';
import { searchMovies, getMovieDetails } from './server/tmdb.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- Authentication Middleware ---
function getAuthenticatedUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const session = db.findSession(token);
  if (!session) return null;
  const user = db.findUserById(session.userId);
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    token: session.token,
  };
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: 'Please login to continue.' });
    return;
  }
  (req as any).user = user;
  next();
}

// --- API Routes ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  const cleanUsername = String(username).trim();
  const cleanEmail = String(email).trim().toLowerCase();

  if (cleanUsername.length < 3) {
    res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match.' });
    return;
  }

  if (db.findUserByEmail(cleanEmail)) {
    res.status(400).json({ error: 'An account with this email already exists.' });
    return;
  }

  if (db.findUserByUsername(cleanUsername)) {
    res.status(400).json({ error: 'An account with this username already exists.' });
    return;
  }

  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();
  const newUser = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    username: cleanUsername,
    email: cleanEmail,
    passwordHash: hash,
    salt,
    createdAt: now,
    updatedAt: now,
  };

  db.createUser(newUser);

  const token = generateToken();
  db.createSession(token, newUser.id);

  res.status(201).json({
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
    },
    token,
  });
});

// 2. Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.findUserByEmail(cleanEmail);

  if (!user) {
    res.status(401).json({ error: 'Email or password is incorrect.' });
    return;
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    res.status(401).json({ error: 'Email or password is incorrect.' });
    return;
  }

  const token = generateToken();
  db.createSession(token, user.id);

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  });
});

// 3. Auth: Current User
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = (req as any).user;
  res.json({ user });
});

// 4. Auth: Logout
app.post('/api/auth/logout', requireAuth, (req, res) => {
  const user = (req as any).user;
  db.deleteSession(user.token);
  res.json({ success: true });
});

// 5. Movies: Search
app.get('/api/movies/search', async (req, res) => {
  try {
    const query = String(req.query.q || '');
    const movies = await searchMovies(query);
    res.json({ movies });
  } catch (err) {
    console.error('Movie search error:', err);
    res.status(500).json({ error: 'Failed to search movies.' });
  }
});

// 6. Movies: Details
app.get('/api/movies/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid movie ID.' });
      return;
    }
    const movie = await getMovieDetails(id);
    if (!movie) {
      res.status(404).json({ error: 'Movie not found.' });
      return;
    }
    res.json({ movie });
  } catch (err) {
    console.error('Movie details error:', err);
    res.status(500).json({ error: 'Failed to fetch movie details.' });
  }
});

// 7. Wishlist: Get All (User specific)
app.get('/api/wishlist', requireAuth, (req, res) => {
  const user = (req as any).user;
  const items = db.getUserWishlist(user.id);
  res.json({ items });
});

// 8. Wishlist: Add
app.post('/api/wishlist', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { movieId, movie } = req.body;

  if (!movieId) {
    res.status(400).json({ error: 'movieId is required.' });
    return;
  }

  let movieData = movie;
  if (!movieData) {
    movieData = await getMovieDetails(Number(movieId));
  }

  const item = db.addToWishlist(user.id, Number(movieId), movieData);
  if (!item) {
    res.status(400).json({ error: 'Movie is already in your wishlist.' });
    return;
  }

  res.status(201).json({ item });
});

// 9. Wishlist: Remove
app.delete('/api/wishlist/:movieId', requireAuth, (req, res) => {
  const user = (req as any).user;
  const movieId = parseInt(req.params.movieId, 10);
  const removed = db.removeFromWishlist(user.id, movieId);
  res.json({ success: removed });
});

// 10. Room: Active Room for user (for homepage live card)
app.get('/api/rooms/user/active', requireAuth, (req, res) => {
  const user = (req as any).user;
  const room = db.findActiveRoomForUser(user.id);
  if (!room) {
    res.json({ room: null });
    return;
  }
  const participants = db.getRoomParticipants(room.id);
  res.json({
    room: {
      id: room.id,
      roomCode: room.roomCode,
      hostId: room.hostId,
      movieId: room.movieId,
      movie: room.movieMetadata,
      status: room.status,
      participantsCount: participants.length,
      createdAt: room.createdAt,
    },
  });
});

// 11. Room: Create Movie Date
app.post('/api/rooms', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { movieId, password } = req.body;

  if (!movieId || !password) {
    res.status(400).json({ error: 'Movie and room password are required.' });
    return;
  }

  if (String(password).trim().length < 4) {
    res.status(400).json({ error: 'Room password must be at least 4 characters.' });
    return;
  }

  const movie = await getMovieDetails(Number(movieId));
  if (!movie) {
    res.status(404).json({ error: 'Selected movie not found.' });
    return;
  }

  const roomCode = generateRoomCode();
  const { hash, salt } = hashPassword(String(password).trim());
  const now = new Date().toISOString();

  const newRoom = {
    id: 'room_' + Math.random().toString(36).substring(2, 9),
    roomCode,
    hostId: user.id,
    movieId: movie.id,
    movieMetadata: movie,
    passwordHash: hash,
    salt,
    status: 'WAITING' as const,
    createdAt: now,
    updatedAt: now,
  };

  db.createRoom(newRoom);
  // Add current user as Host participant
  db.addRoomParticipant(newRoom.id, user.id, user.username);
  // Initialize playback state
  db.setPlaybackState(newRoom.id, 0, false);

  res.status(201).json({
    room: {
      id: newRoom.id,
      roomCode: newRoom.roomCode,
      hostId: newRoom.hostId,
      movieId: newRoom.movieId,
      movie: newRoom.movieMetadata,
      status: newRoom.status,
      createdAt: newRoom.createdAt,
    },
  });
});

// 12. Room: Public Info by Room Code (before joining, password never sent)
app.get('/api/rooms/:roomCode', (req, res) => {
  const room = db.findRoomByCode(req.params.roomCode);
  if (!room) {
    res.status(404).json({ error: "We couldn't find this movie date." });
    return;
  }

  const participants = db.getRoomParticipants(room.id);
  res.json({
    room: {
      id: room.id,
      roomCode: room.roomCode,
      hostId: room.hostId,
      movieId: room.movieId,
      movie: room.movieMetadata,
      status: room.status,
      participantCount: participants.length,
      isFull: participants.length >= 2,
      createdAt: room.createdAt,
    },
  });
});

// 13. Room: Join Room (Verify Password & Participant Limit)
app.post('/api/rooms/:roomCode/join', requireAuth, (req, res) => {
  const user = (req as any).user;
  const { password } = req.body;
  const room = db.findRoomByCode(req.params.roomCode);

  if (!room) {
    res.status(404).json({ error: "We couldn't find this movie date." });
    return;
  }

  // Check if user is already a participant
  const currentParticipants = db.getRoomParticipants(room.id);
  const isAlreadyIn = currentParticipants.some(p => p.userId === user.id);

  if (!isAlreadyIn) {
    // If not in, verify password
    if (!password) {
      res.status(400).json({ error: 'Room password is required.' });
      return;
    }
    const isPasswordValid = verifyPassword(String(password).trim(), room.passwordHash, room.salt);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'That room password is incorrect.' });
      return;
    }

    // Check 2-person limit
    if (currentParticipants.length >= 2) {
      res.status(403).json({ error: 'This movie date is already full ❤️' });
      return;
    }

    db.addRoomParticipant(room.id, user.id, user.username);
  }

  // Update status to ACTIVE if 2 participants
  const updatedParticipants = db.getRoomParticipants(room.id);
  if (updatedParticipants.length >= 2 && room.status === 'WAITING') {
    db.updateRoom(room.id, { status: 'ACTIVE' });
    room.status = 'ACTIVE';
  }

  res.json({
    success: true,
    room: {
      id: room.id,
      roomCode: room.roomCode,
      hostId: room.hostId,
      movieId: room.movieId,
      movie: room.movieMetadata,
      status: room.status,
      participants: updatedParticipants,
    },
  });
});

// 14. Room: Room State (Playback, Participants, Messages)
app.get('/api/rooms/:roomCode/state', requireAuth, (req, res) => {
  const user = (req as any).user;
  const room = db.findRoomByCode(req.params.roomCode);

  if (!room) {
    res.status(404).json({ error: "We couldn't find this movie date." });
    return;
  }

  const participants = db.getRoomParticipants(room.id);
  const isAuthorized = participants.some(p => p.userId === user.id);

  if (!isAuthorized) {
    res.status(403).json({ error: 'You are not a participant in this movie date.' });
    return;
  }

  const playbackState = db.getPlaybackState(room.id) || {
    id: 'default',
    roomId: room.id,
    currentTime: 0,
    isPlaying: false,
    updatedAt: new Date().toISOString(),
  };

  const messages = db.getRoomMessages(room.id);

  res.json({
    room: {
      id: room.id,
      roomCode: room.roomCode,
      hostId: room.hostId,
      movieId: room.movieId,
      movie: room.movieMetadata,
      status: room.status,
    },
    participants,
    playbackState,
    messages,
  });
});

// 15. Room: Update Playback State (Synchronize Play/Pause/Seek)
app.post('/api/rooms/:roomCode/playback', requireAuth, (req, res) => {
  const user = (req as any).user;
  const room = db.findRoomByCode(req.params.roomCode);

  if (!room) {
    res.status(404).json({ error: 'Room not found.' });
    return;
  }

  const participants = db.getRoomParticipants(room.id);
  const isAuthorized = participants.some(p => p.userId === user.id);
  if (!isAuthorized) {
    res.status(403).json({ error: 'Unauthorized.' });
    return;
  }

  const { currentTime, isPlaying } = req.body;
  const state = db.setPlaybackState(room.id, Number(currentTime) || 0, Boolean(isPlaying));

  res.json({ playbackState: state });
});

// 16. Room: Send Chat Message
app.post('/api/rooms/:roomCode/chat', requireAuth, (req, res) => {
  const user = (req as any).user;
  const room = db.findRoomByCode(req.params.roomCode);

  if (!room) {
    res.status(404).json({ error: 'Room not found.' });
    return;
  }

  const participants = db.getRoomParticipants(room.id);
  const isAuthorized = participants.some(p => p.userId === user.id);
  if (!isAuthorized) {
    res.status(403).json({ error: 'Unauthorized.' });
    return;
  }

  const { message } = req.body;
  if (!message || String(message).trim() === '') {
    res.status(400).json({ error: 'Message cannot be empty.' });
    return;
  }

  // HTML sanitization to avoid XSS
  const sanitized = String(message)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .slice(0, 500);

  const chatMessage = db.addMessage(room.id, user.id, user.username, sanitized);
  res.status(201).json({ message: chatMessage });
});

// --- Vite Middleware / Static Serving ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RimJim Server running on port ${PORT}`);
  });
}

startServer();
