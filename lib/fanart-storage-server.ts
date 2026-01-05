import { FanArt } from '@/types';
import { Redis } from '@upstash/redis';

const STORAGE_KEY = 'fanart_gallery';

// In-memory fallback for local development when Redis is not configured
let inMemoryStore: FanArt[] = [];

// Initialize Redis client (supports both Vercel KV and Upstash Redis)
const getRedisClient = () => {
  // Try Upstash Redis first (recommended)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  // Fallback to Vercel KV format (legacy support)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return null;
};

// Check if Redis is configured
const isRedisConfigured = () => {
  return !!getRedisClient();
};

// Server-side storage using Vercel KV (serverless-compatible)
// TODO: Replace with NestJS API calls when backend is ready
// Example: fetch(`${process.env.API_URL}/fanart`)
export const fanArtStorageServer = {
  // Get all fan arts
  getAll: async (): Promise<FanArt[]> => {
    try {
      const redis = getRedisClient();
      if (redis) {
        const data = await redis.get<FanArt[]>(STORAGE_KEY);
        return data || [];
      }
      // Fallback: use in-memory store for local dev
      return inMemoryStore;
    } catch (error) {
      console.error('Error reading fan arts from Redis:', error);
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
      const redis = getRedisClient();
      if (redis) {
        const all = await fanArtStorageServer.getAll();
        all.push(newFanArt);
        await redis.set(STORAGE_KEY, all);
      } else {
        // Fallback: use in-memory store for local dev
        inMemoryStore.push(newFanArt);
      }
      return newFanArt;
    } catch (error) {
      console.error('Error saving fan art to Redis:', error);
      // Fallback: save to in-memory store even if Redis fails
      inMemoryStore.push(newFanArt);
      return newFanArt;
    }
  },

  // Update fan art
  update: async (id: string, updates: Partial<FanArt>): Promise<FanArt> => {
    try {
      const redis = getRedisClient();
      if (redis) {
        const all = await fanArtStorageServer.getAll();
        const index = all.findIndex((art) => art.id === id);
        
        if (index === -1) {
          throw new Error('Fan art not found');
        }
        
        const updated = { ...all[index], ...updates };
        all[index] = updated;
        await redis.set(STORAGE_KEY, all);
        
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
      console.error('Error updating fan art in Redis:', error);
      throw error instanceof Error ? error : new Error('Failed to update fan art');
    }
  },

  // Delete fan art
  delete: async (id: string): Promise<void> => {
    try {
      const redis = getRedisClient();
      if (redis) {
        const all = await fanArtStorageServer.getAll();
        const filtered = all.filter((art) => art.id !== id);
        await redis.set(STORAGE_KEY, filtered);
      } else {
        // Fallback: use in-memory store for local dev
        inMemoryStore = inMemoryStore.filter((art) => art.id !== id);
      }
    } catch (error) {
      console.error('Error deleting fan art from Redis:', error);
      throw new Error('Failed to delete fan art');
    }
  },
};
