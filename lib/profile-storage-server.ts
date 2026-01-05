import { Profile } from '@/types';
import { Redis } from '@upstash/redis';

const STORAGE_KEY = 'profile_data';

// Default profile data
const defaultProfile: Profile = {
  name: 'HEROOXR',
  bio: 'Gaming content creator and streamer. Join me for epic adventures and unforgettable moments!',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HEROOXR',
  twitchStatus: 'offline',
  socialLinks: {
    twitch: 'https://twitch.tv/herooxr',
    twitter: 'https://twitter.com/HEROOXR',
    tiktok: 'https://www.tiktok.com/@theproperhero',
    discord: '',
  },
};

// In-memory fallback for local development when Redis is not configured
let inMemoryProfile: Profile | null = null;

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

// Server-side profile storage using Vercel KV (serverless-compatible)
// TODO: Replace with NestJS API calls when backend is ready
// Example: fetch(`${process.env.API_URL}/profile`)
export const profileStorageServer = {
  // Get profile
  get: async (): Promise<Profile> => {
    try {
      const redis = getRedisClient();
      if (redis) {
        const data = await redis.get<Profile>(STORAGE_KEY);
        return data || defaultProfile;
      }
      // Fallback: use in-memory store or default for local dev
      return inMemoryProfile || defaultProfile;
    } catch (error) {
      console.error('Error reading profile from Redis:', error);
      return inMemoryProfile || defaultProfile;
    }
  },

  // Update profile
  update: async (profile: Partial<Profile>): Promise<Profile> => {
    try {
      const redis = getRedisClient();
      if (redis) {
        const current = await profileStorageServer.get();
        const updated = { ...current, ...profile };
        await redis.set(STORAGE_KEY, updated);
        return updated;
      } else {
        // Fallback: use in-memory store for local dev
        const current = inMemoryProfile || defaultProfile;
        const updated = { ...current, ...profile };
        inMemoryProfile = updated;
        return updated;
      }
    } catch (error) {
      console.error('Error updating profile in Redis:', error);
      // Fallback: update in-memory store even if Redis fails
      const current = inMemoryProfile || defaultProfile;
      const updated = { ...current, ...profile };
      inMemoryProfile = updated;
      return updated;
    }
  },
};
