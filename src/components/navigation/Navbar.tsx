import React, { useState } from 'react';
import { Film, Heart, LogIn, LogOut, Menu, UserPlus, X, Sparkles } from 'lucide-react';
import { AppView, User } from '../../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  currentUser: User | null;
  onLogout: () => void;
  activeRoomCode?: string | null;
  onOpenJoinRoom?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  activeRoomCode,
  onOpenJoinRoom,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header id="rimjim-header" className="sticky top-0 z-50 w-full border-b border-rose-950/40 bg-[#0b0c10]/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button
          id="nav-brand-logo"
          onClick={() => handleNavClick('home')}
          className="group flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg p-1"
          aria-label="RimJim Home"
        >
          <span className="font-serif text-2xl font-bold tracking-wider text-rose-100 transition-colors group-hover:text-white">
            RIMJIM
          </span>
          <span className="text-xl text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
            ❤️
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav id="nav-desktop-links" className="hidden md:flex md:items-center md:gap-8">
          <button
            id="nav-link-home"
            onClick={() => handleNavClick('home')}
            className={`text-sm font-medium transition-colors hover:text-rose-200 ${
              currentView === 'home' ? 'text-rose-400 font-semibold' : 'text-neutral-300'
            }`}
          >
            Home
          </button>
          <button
            id="nav-link-movie-date"
            onClick={() => handleNavClick('movies')}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-rose-200 ${
              currentView === 'movies' || currentView === 'create-date'
                ? 'text-rose-400 font-semibold'
                : 'text-neutral-300'
            }`}
          >
            <Film className="h-4 w-4 text-rose-400/80" />
            <span>Movie Date</span>
            {activeRoomCode && (
              <span className="ml-1 inline-flex items-center rounded-full bg-rose-950/80 px-2 py-0.5 text-[10px] font-medium text-rose-300 border border-rose-800/40 animate-pulse">
                Live
              </span>
            )}
          </button>
          <button
            id="nav-link-wishlist"
            onClick={() => handleNavClick('wishlist')}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-rose-200 ${
              currentView === 'wishlist' ? 'text-rose-400 font-semibold' : 'text-neutral-300'
            }`}
          >
            <Heart className="h-4 w-4 text-rose-400/80" />
            <span>Wishlist</span>
          </button>
          {onOpenJoinRoom && (
            <button
              id="nav-link-join-room"
              onClick={onOpenJoinRoom}
              className="text-xs font-semibold text-rose-400/90 hover:text-rose-300 transition-colors border border-rose-900/40 bg-rose-950/20 px-2.5 py-1 rounded-lg"
            >
              Enter Code
            </button>
          )}
        </nav>

        {/* Desktop Auth Controls */}
        <div id="nav-desktop-auth" className="hidden md:flex md:items-center md:gap-4">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-rose-900/30 bg-rose-950/20 px-3 py-1.5 text-xs text-rose-200">
                <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                <span>
                  Hello, <strong className="font-medium text-white">{currentUser.username}</strong>
                </span>
              </div>
              <button
                id="nav-btn-logout"
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-rose-900/40 hover:bg-neutral-800 hover:text-white"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                id="nav-btn-login"
                onClick={() => handleNavClick('login')}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:text-white"
              >
                <LogIn className="h-4 w-4 text-neutral-400" />
                <span>Login</span>
              </button>
              <button
                id="nav-btn-register"
                onClick={() => handleNavClick('register')}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600/90 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm shadow-rose-950 transition-all hover:bg-rose-500 hover:shadow-rose-900/40 active:scale-98"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden">
          <button
            id="nav-mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-400 hover:bg-neutral-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div id="nav-mobile-dropdown" className="border-b border-neutral-800 bg-[#0f1016] px-4 pt-3 pb-6 md:hidden">
          <div className="flex flex-col space-y-3">
            <button
              id="mobile-nav-link-home"
              onClick={() => handleNavClick('home')}
              className={`flex items-center rounded-lg px-3 py-2.5 text-base font-medium ${
                currentView === 'home'
                  ? 'bg-rose-950/50 text-rose-300 font-semibold'
                  : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              id="mobile-nav-link-movie-date"
              onClick={() => handleNavClick('movies')}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium ${
                currentView === 'movies' || currentView === 'create-date'
                  ? 'bg-rose-950/50 text-rose-300 font-semibold'
                  : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Film className="h-4 w-4 text-rose-400" />
                <span>Movie Date</span>
              </span>
              {activeRoomCode && (
                <span className="rounded-full bg-rose-950 px-2 py-0.5 text-xs text-rose-300 border border-rose-800">
                  Live
                </span>
              )}
            </button>
            <button
              id="mobile-nav-link-wishlist"
              onClick={() => handleNavClick('wishlist')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium ${
                currentView === 'wishlist'
                  ? 'bg-rose-950/50 text-rose-300 font-semibold'
                  : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <Heart className="h-4 w-4 text-rose-400" />
              <span>Wishlist</span>
            </button>

            <div className="pt-3 border-t border-neutral-800">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="px-3 py-2 text-sm text-neutral-300">
                    Signed in as <strong className="text-white">{currentUser.username}</strong>
                  </div>
                  <button
                    id="mobile-nav-btn-logout"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm font-medium text-rose-300 hover:bg-neutral-800"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    id="mobile-nav-btn-login"
                    onClick={() => handleNavClick('login')}
                    className="flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </button>
                  <button
                    id="mobile-nav-btn-register"
                    onClick={() => handleNavClick('register')}
                    className="flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-rose-500"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Create Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
