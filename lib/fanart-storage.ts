import { FanArt } from '@/types';

const STORAGE_KEY = 'fanart_gallery';
const ADMIN_SESSION_KEY = 'admin_session';

// Fan Art Storage (using localStorage for now, will be replaced with API in Phase 2)
export const fanArtStorage = {
  // Get all fan arts
  getAll: (): FanArt[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Add new fan art
  add: (fanArt: Omit<FanArt, 'id' | 'createdAt'>): FanArt => {
    const newFanArt: FanArt = {
      ...fanArt,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    // Only use localStorage on client-side
    if (typeof window === 'undefined') {
      // Server-side: return the fan art but can't persist to localStorage
      // In Phase 2, this will save to database
      return newFanArt;
    }

    const all = fanArtStorage.getAll();
    all.push(newFanArt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('fanart-updated', { detail: newFanArt }));
    
    return newFanArt;
  },

  // Delete fan art
  delete: (id: string): void => {
    // Only use localStorage on client-side
    if (typeof window === 'undefined') {
      // Server-side: can't delete from localStorage
      // In Phase 2, this will delete from database
      return;
    }

    const all = fanArtStorage.getAll();
    const filtered = all.filter((art) => art.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('fanart-updated', { detail: { deletedId: id } }));
  },

  // Clear all (for testing)
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};

// Admin Session Management
export const adminSession = {
  // Check if admin is logged in
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!session) return false;

    try {
      const { expiresAt } = JSON.parse(session);
      return new Date().getTime() < expiresAt;
    } catch {
      return false;
    }
  },

  // Login (set session)
  login: (): void => {
    if (typeof window === 'undefined') return;
    
    // Session expires in 24 hours
    const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000;
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ expiresAt }));
  },

  // Logout
  logout: (): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  },
};
