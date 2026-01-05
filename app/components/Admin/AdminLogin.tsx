'use client';

import { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => boolean;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple password check - In Phase 2, this will use your NestJS auth API
    // For now, using a simple password (should be env variable in production)
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    
    if (onLogin(password)) {
      // Success - parent component will handle navigation
    } else {
      setError('Incorrect password. Access denied.');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--purple-primary)]/20 border border-[var(--purple-primary)]/50 mb-4">
              <Lock className="w-8 h-8 text-[var(--purple-primary)]" />
            </div>
            <h1 className="text-3xl font-bold purple-glow text-[var(--purple-primary)] mb-2">
              Admin Access
            </h1>
            <p className="text-[var(--purple-glow)]/60">
              Enter password to access admin panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--purple-glow)] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 rounded-lg text-[var(--purple-glow)] placeholder:text-[var(--purple-glow)]/40 focus:outline-none focus:border-[var(--purple-primary)] transition-colors"
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-[var(--purple-primary)] hover:bg-[var(--purple-vibrant)] text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
