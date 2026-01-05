import { FanArt } from '@/types';
import { kv } from '@vercel/kv';

const STORAGE_KEY = 'fanart_gallery';

// Server-side storage using Vercel KV (serverless-compatible)
// TODO: Replace with NestJS API calls when backend is ready
// Example: fetch(`${process.env.API_URL}/fanart`)
export const fanArtStorageServer = {
  // Get all fan arts
  getAll: async (): Promise<FanArt[]> => {
    try {
      // Check if KV is configured (for Vercel deployment)
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const data = await kv.get<FanArt[]>(STORAGE_KEY);
        return data || [];
      }
      // Fallback: return empty array if KV not configured (local dev)
      return [];
    } catch (error) {
      console.error('Error reading fan arts from KV:', error);
      return [];
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
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const all = await fanArtStorageServer.getAll();
        all.push(newFanArt);
        await kv.set(STORAGE_KEY, all);
      }
      // If KV not configured, still return the fan art (for local dev/testing)
      return newFanArt;
    } catch (error) {
      console.error('Error saving fan art to KV:', error);
      throw new Error('Failed to save fan art');
    }
  },

  // Update fan art
  update: async (id: string, updates: Partial<FanArt>): Promise<FanArt> => {
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const all = await fanArtStorageServer.getAll();
        const index = all.findIndex((art) => art.id === id);
        
        if (index === -1) {
          throw new Error('Fan art not found');
        }
        
        const updated = { ...all[index], ...updates };
        all[index] = updated;
        await kv.set(STORAGE_KEY, all);
        
        return updated;
      }
      throw new Error('Storage not configured');
    } catch (error) {
      console.error('Error updating fan art in KV:', error);
      throw error instanceof Error ? error : new Error('Failed to update fan art');
    }
  },

  // Delete fan art
  delete: async (id: string): Promise<void> => {
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const all = await fanArtStorageServer.getAll();
        const filtered = all.filter((art) => art.id !== id);
        await kv.set(STORAGE_KEY, filtered);
      }
    } catch (error) {
      console.error('Error deleting fan art from KV:', error);
      throw new Error('Failed to delete fan art');
    }
  },
};
