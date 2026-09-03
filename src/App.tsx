import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { HeroSection } from './components/home/HeroSection';
import { ActiveDateCard } from './components/home/ActiveDateCard';
import { IntimateRitual } from './components/home/IntimateRitual';
import { Footer } from './components/layout/Footer';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { MovieSearch } from './components/movies/MovieSearch';
import { MovieDetailsModal } from './components/movies/MovieDetailsModal';
import { WishlistView } from './components/wishlist/WishlistView';
import { CreateDateModal } from './components/rooms/CreateDateModal';
import { WaitingRoom } from './components/rooms/WaitingRoom';
import { JoinRoomModal } from './components/rooms/JoinRoomModal';
import { WatchRoom } from './components/rooms/WatchRoom';
import { AppView, User, Room, Movie, WishlistItem } from './types';
import { api, getStoredToken, getStoredUser, clearStoredAuth } from './lib/api';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [intendedView, setIntendedView] = useState<AppView | null>(null);

  // Movie and Wishlist State
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movieToDate, setMovieToDate] = useState<Movie | null>(null);

  // Join Room State
  const [joinModalCode, setJoinModalCode] = useState<string | null>(null);

  // Check URL query parameters for ?room=RJ-XXXXX invite links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setJoinModalCode(roomParam.toUpperCase());
    }
  }, []);

  // Fetch active room for user from server
  const fetchActiveRoom = useCallback(async () => {
    try {
      const res = await api.rooms.getActive();
      setActiveRoom(res.room);
    } catch {
      setActiveRoom(null);
    }
  }, []);

  // Fetch wishlist items
  const fetchWishlist = useCallback(async () => {
    try {
      const res = await api.wishlist.getAll();
      setWishlistItems(res.items);
    } catch {
      setWishlistItems([]);
    }
  }, []);

  // Initialize and verify authentication on boot
  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      setCurrentUser(storedUser);
      // Verify session with server in background
      api.auth.me()
        .then((res) => {
          setCurrentUser(res.user);
          fetchActiveRoom();
          fetchWishlist();
        })
        .catch(() => {
          // Token invalid or expired
          clearStoredAuth();
          setCurrentUser(null);
          setActiveRoom(null);
          setWishlistItems([]);
        });
    }
  }, [fetchActiveRoom, fetchWishlist]);

  const handleNavigate = (view: AppView) => {
    const isProtected = ['wishlist', 'create-date', 'waiting-room', 'watch-room'].includes(view);
    if (isProtected && !currentUser) {
      setIntendedView(view);
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    fetchActiveRoom();
    fetchWishlist();
    if (intendedView) {
      setCurrentView(intendedView);
      setIntendedView(null);
    } else {
      setCurrentView('home');
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
    setActiveRoom(null);
    setWishlistItems([]);
    setCurrentView('home');
  };

  const handleContinueRoom = (roomCode: string) => {
    if (activeRoom?.status === 'WAITING') {
      setCurrentView('waiting-room');
    } else {
      setCurrentView('watch-room');
    }
  };

  // Wishlist toggle handler
  const handleToggleWishlist = async (movie: Movie) => {
    if (!currentUser) {
      setIntendedView('movies');
      setCurrentView('login');
      return;
    }

    const isExisting = wishlistItems.some((item) => item.movieId === movie.id);
    if (isExisting) {
      try {
        await api.wishlist.remove(movie.id);
        setWishlistItems((prev) => prev.filter((item) => item.movieId !== movie.id));
      } catch (err) {
        console.error('Failed to remove from wishlist', err);
      }
    } else {
      try {
        const res = await api.wishlist.add(movie.id, movie);
        setWishlistItems((prev) => [res.item, ...prev]);
      } catch (err) {
        console.error('Failed to add to wishlist', err);
      }
    }
  };

  const handleRemoveWishlistItem = async (movieId: number) => {
    try {
      await api.wishlist.remove(movieId);
      setWishlistItems((prev) => prev.filter((item) => item.movieId !== movieId));
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  // Initiate date from movie
  const handleStartMovieDate = (movie: Movie) => {
    if (!currentUser) {
      setIntendedView('movies');
      setCurrentView('login');
      return;
    }
    setSelectedMovie(null);
    setMovieToDate(movie);
  };

  const handleRoomCreated = (room: Room) => {
    setActiveRoom(room);
    setMovieToDate(null);
    setCurrentView('waiting-room');
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    setCurrentView('home');
  };

  const handleRoomJoined = (room: Room) => {
    setActiveRoom(room);
    setJoinModalCode(null);
    setCurrentView('watch-room');
  };

  const wishlistMovieIds = wishlistItems.map((item) => item.movieId);

  return (
    <div id="rimjim-app-root" className="min-h-screen flex flex-col bg-[#0b0c10] text-[#f3f4f6]">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeRoomCode={activeRoom?.roomCode}
        onOpenJoinRoom={() => setJoinModalCode('')}
      />

      {/* Main Content View Container */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroSection
              onNavigate={handleNavigate}
              isAuthenticated={!!currentUser}
            />
            <ActiveDateCard
              activeRoom={activeRoom}
              isAuthenticated={!!currentUser}
              onNavigate={handleNavigate}
              onContinueRoom={handleContinueRoom}
            />
            <IntimateRitual />
          </>
        )}

        {currentView === 'login' && (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setCurrentView('register')}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'register' && (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setCurrentView('login')}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'movies' && (
          <MovieSearch
            onSelectMovie={(movie) => setSelectedMovie(movie)}
            onAddToWishlist={handleToggleWishlist}
            wishlistIds={wishlistMovieIds}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistView
            items={wishlistItems}
            onSelectMovie={(movie) => setSelectedMovie(movie)}
            onRemoveItem={handleRemoveWishlistItem}
            onStartMovieDate={handleStartMovieDate}
            onBrowseMovies={() => setCurrentView('movies')}
          />
        )}

        {currentView === 'waiting-room' && activeRoom && (
          <WaitingRoom
            room={activeRoom}
            onPartnerJoined={() => setCurrentView('watch-room')}
            onCancel={handleLeaveRoom}
          />
        )}

        {currentView === 'watch-room' && activeRoom && currentUser && (
          <WatchRoom
            room={activeRoom}
            currentUser={currentUser}
            onLeaveRoom={handleLeaveRoom}
          />
        )}
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onMakeMovieDate={handleStartMovieDate}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlistMovieIds.includes(selectedMovie.id)}
        />
      )}

      {/* Create Date Modal */}
      {movieToDate && (
        <CreateDateModal
          movie={movieToDate}
          onClose={() => setMovieToDate(null)}
          onRoomCreated={handleRoomCreated}
        />
      )}

      {/* Join Room Modal */}
      {joinModalCode !== null && (
        <JoinRoomModal
          initialRoomCode={joinModalCode}
          onClose={() => setJoinModalCode(null)}
          onJoined={handleRoomJoined}
        />
      )}

      {/* TMDB Official Attribution Footer */}
      <Footer />
    </div>
  );
}
