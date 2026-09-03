import React, { useState } from 'react';
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { User } from '../../types';

interface LoginFormProps {
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
  onCancel: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onCancel,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.login(email.trim(), password);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Email or password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e1017]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center rounded-2xl bg-rose-950/40 p-3 text-rose-500 border border-rose-900/30">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome Back ❤️
          </h1>
          <p className="mt-1.5 text-xs text-neutral-400">
            Sign in to your private movie-date account.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div 
            id="login-error-alert" 
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-900/50 bg-rose-950/30 p-3.5 text-xs text-rose-200"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/90 py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white shadow-md shadow-rose-950 transition-all hover:bg-rose-500 active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 border-t border-neutral-800/80 pt-5 text-center text-xs text-neutral-400">
          <span>Don&apos;t have an account yet? </span>
          <button
            id="login-switch-to-register"
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium text-rose-400 hover:text-rose-300 hover:underline"
          >
            Create Account
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            id="login-back-home"
            type="button"
            onClick={onCancel}
            className="text-xs text-neutral-500 hover:text-neutral-300"
          >
            ← Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};
