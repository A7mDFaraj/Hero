'use client';

import Link from 'next/link';
import { Home, Settings } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="fixed top-4 right-4 z-50 flex gap-2">
      <Link
        href="/"
        className="p-3 bg-[var(--purple-darker)]/80 backdrop-blur-sm border border-[var(--purple-primary)]/30 hover:border-[var(--purple-primary)] rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]"
        aria-label="Home"
      >
        <Home className="w-5 h-5 text-[var(--purple-glow)]" />
      </Link>
      <Link
        href="/admin"
        className="p-3 bg-[var(--purple-darker)]/80 backdrop-blur-sm border border-[var(--purple-primary)]/30 hover:border-[var(--purple-primary)] rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]"
        aria-label="Admin Panel"
      >
        <Settings className="w-5 h-5 text-[var(--purple-glow)]" />
      </Link>
    </nav>
  );
}
