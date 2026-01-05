import { FanArt } from '@/types';
import { kv } from '@vercel/kv';

const STORAGE_KEY = 'fanart_gallery';

// In-memory fallback for local development when KV is not configured
let inMemoryStore: FanArt[] = [];

// Check if KV is configured
const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

// Server-side storage using Vercel KV (serverless-compatible)
// TODO: Replace with NestJS API calls when backend is ready
// Example: fetch(`${process.env.API_URL}/fanart`)
export const fanArtStorageServer = {
  // Get all fan arts
  getAll: async (): Promise<FanArt[]> => {
    try {
      if (isKVConfigured()) {
        const data = await kv.get<FanArt[]>(STORAGE_KEY);
        return data || [];
      }
      // Fallback: use in-memory store for local dev
      return inMemoryStore;
    } catch (error) {
      console.error('Error reading fan arts from KV:', error);
      // Fallback to in-memory on error
      return inMemoryStore;
    }
  },

  // Add new fan art
  add: async (fanArt: Omit<FanArt, 'id' | 'createdAt'>): Promise<FanArt> => {
    const newFanArt: FanArt = {
      ...fanArt,
      likes: fanArt.likes ?? 0,
      dislikes: fanArt.dislikes ?? 0,
      isActive: fanArt.isActive !== undefined ? fanArt.isActive : true,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    try {
      if (isKVConfigured()) {
        const all = await fanArtStorageServer.getAll();
        all.push(newFanArt);
        await kv.set(STORAGE_KEY, all);
      } else {
        // Fallback: use in-memory store for local dev
        inMemoryStore.push(newFanArt);
      }
      return newFanArt;
    } catch (error) {
      console.error('Error saving fan art to KV:', error);
      // Fallback: save to in-memory store even if KV fails
      inMemoryStore.push(newFanArt);
      return newFanArt;
    }
  },

  // Update fan art
  update: async (id: string, updates: Partial<FanArt>): Promise<FanArt> => {
    try {
      if (isKVConfigured()) {
        const all = await fanArtStorageServer.getAll();
        const index = all.findIndex((art) => art.id === id);
        
        if (index === -1) {
          throw new Error('Fan art not found');
        }
        
        const updated = { ...all[index], ...updates };
        all[index] = updated;
        await kv.set(STORAGE_KEY, all);
        
        return updated;
      } else {
        // Fallback: use in-memory store for local dev
        const index = inMemoryStore.findIndex((art) => art.id === id);
        if (index === -1) {
          throw new Error('Fan art not found');
        }
        const updated = { ...inMemoryStore[index], ...updates };
        inMemoryStore[index] = updated;
        return updated;
      }
    } catch (error) {
      console.error('Error updating fan art in KV:', error);
      throw error instanceof Error ? error : new Error('Failed to update fan art');
    }
  },

  // Delete fan art
  delete: async (id: string): Promise<void> => {
    try {
      if (isKVConfigured()) {
        const all = await fanArtStorageServer.getAll();
        const filtered = all.filter((art) => art.id !== id);
        await kv.set(STORAGE_KEY, filtered);
      } else {
        // Fallback: use in-memory store for local dev
        inMemoryStore = inMemoryStore.filter((art) => art.id !== id);
      }
    } catch (error) {
      console.error('Error deleting fan art from KV:', error);
      throw new Error('Failed to delete fan art');
    }
  },
};
