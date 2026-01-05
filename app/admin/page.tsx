'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPanel from '../components/Admin/AdminPanel';
import AdminLogin from '../components/Admin/AdminLogin';
import { adminSession } from '@/lib/fanart-storage';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    setIsAuthenticated(adminSession.isAuthenticated());
    setIsChecking(false);
  }, []);

  const handleLogin = (password: string): boolean => {
    // TODO: Replace with API call to NestJS backend
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ password }),
    // });
    // if (response.ok) { adminSession.login(); return true; }

    // For now, simple password check
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      adminSession.login();
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    adminSession.logout();
    setIsAuthenticated(false);
    router.push('/');
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--purple-primary)]/30 border-t-[var(--purple-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold purple-glow text-[var(--purple-primary)]">
            Admin Panel
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg transition-all duration-300 text-sm font-medium"
          >
            Logout
          </button>
        </div>
        <AdminPanel />
      </div>
    </div>
  );
}
