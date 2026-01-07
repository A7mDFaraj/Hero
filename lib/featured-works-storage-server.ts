import { FeaturedWork } from '@/types';
import { Redis } from '@upstash/redis';

const STORAGE_KEY = 'featured_works';

// In-memory fallback for local development when Redis is not configured
let inMemoryStore: FeaturedWork[] = [];

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

// Server-side storage using Vercel KV (serverless-compatible)
// TODO: Replace with NestJS API calls when backend is ready
// Example: fetch(`${process.env.API_URL}/featured-works`)
export const featuredWorksStorageServer = {
  // Get all featured works
  getAll: async (): Promise<FeaturedWork[]> => {
    try {
      const redis = getRedisClient();
      if (redis) {
        const data = await redis.get<FeaturedWork[]>(STORAGE_KEY);
        return data || [];
      }
      // Fallback: use in-memory store for local dev
      return inMemoryStore;
    } catch (error) {
      console.error('Error reading featured works from Redis:', error);
      return inMemoryStore;
    }
  },

  // Add new featured work
  add: async (work: Omit<FeaturedWork, 'id' | 'createdAt'>): Promise<FeaturedWork> => {
    const newWork: FeaturedWork = {
      ...work,
      isActive: work.isActive !== undefined ? work.isActive : true,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const redis = getRedisClient();
      if (redis) {
        const all = await featuredWorksStorageServer.getAll();
        all.push(newWork);
        await redis.set(STORAGE_KEY, all);
      } else {
        // Fallback: use in-memory store for local dev
        inMemoryStore.push(newWork);
      }
      return newWork;
    } catch (error) {
      console.error('Error saving featured work to Redis:', error);
      inMemoryStore.push(newWork);
      return newWork;
    }
  },

  // Update featured work
  update: async (id: string, updates: Partial<FeaturedWork>): Promise<FeaturedWork> => {
    try {
      const redis = getRedisClient();
      if (redis) {
        const all = await featuredWorksStorageServer.getAll();
        const index = all.findIndex((work) => work.id === id);
        
        if (index === -1) {
          throw new Error('Featured work not found');
        }
        
        const updated = { ...all[index], ...updates };
        all[index] = updated;
        await redis.set(STORAGE_KEY, all);
        
        return updated;
      } else {
        // Fallback: use in-memory store for local dev
        const index = inMemoryStore.findIndex((work) => work.id === id);
        if (index === -1) {
          throw new Error('Featured work not found');
        }
        const updated = { ...inMemoryStore[index], ...updates };
        inMemoryStore[index] = updated;
        return updated;
      }
    } catch (error) {
      console.error('Error updating featured work in Redis:', error);
      throw error instanceof Error ? error : new Error('Failed to update featured work');
    }
  },

  // Delete featured work
  delete: async (id: string): Promise<void> => {
    try {
      const redis = getRedisClient();
      if (redis) {
        const all = await featuredWorksStorageServer.getAll();
        const filtered = all.filter((work) => work.id !== id);
        await redis.set(STORAGE_KEY, filtered);
      } else {
        // Fallback: use in-memory store for local dev
        inMemoryStore = inMemoryStore.filter((work) => work.id !== id);
      }
    } catch (error) {
      console.error('Error deleting featured work from Redis:', error);
      throw new Error('Failed to delete featured work');
    }
  },
};
