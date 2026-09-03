# RimJim ❤️ — Private Virtual Movie Dates

> "Pick a movie. Invite your person. Make it a date. ❤️"

RimJim is a private virtual movie-date web application designed for two people in a relationship who want to watch a movie together remotely. It provides synchronized playback, real-time private room chat, TMDB movie discovery, shared wishlists, and an intimate, distraction-free cinematic atmosphere.

---

## 🎬 Features & Core User Experience

1. **Intimate Cinematic Atmosphere**: Deep dark cinematic styling with warm romantic accents designed for two.
2. **TMDB Movie Discovery**: Search titles, inspect posters, ratings, release years, and synopses with official TMDB attribution.
3. **Private Movie Wishlist**: Save favorite movies to watch later and turn any wishlist item directly into a movie date.
4. **2-Person Private Room Security**: Password-protected rooms with custom room codes (`RJ-XXXXX`), invite links, and a strict 2-participant maximum (Host + Partner).
5. **Synchronized Playback**: Coordinated play, pause, seek, and drift recovery.
6. **In-Room Private Chat**: Real-time communication while watching without leaving the movie view.
7. **Active Date on Homepage**: Immediate access to ongoing movie dates right from the home screen.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Backend**: Express, Node.js, WebSockets / real-time sync
- **Database Architecture**: Relational schema (Prisma-compatible) supporting PostgreSQL / Supabase
- **Metadata Provider**: The Movie Database (TMDB) API
- **Deployment**: Google Cloud Run (Port 3000)

---

## 🔑 Environment Configuration

Create a `.env.local` (or configure via environment variables):

```env
# Database connection (PostgreSQL / Supabase)
DATABASE_URL="postgresql://user:password@localhost:5432/rimjim"

# The Movie Database (TMDB) API Key
TMDB_API_KEY="your_tmdb_api_key_here"

# Authentication & Session Secret
AUTH_SECRET="your_secure_random_auth_secret"

# Public Application URL
APP_URL="http://localhost:3000"
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```
