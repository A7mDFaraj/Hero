import { Profile } from '@/types';
import { kv } from '@vercel/kv';

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

// In-memory fallback for local development when KV is not configured
let inMemoryProfile: Profile | null = null;

// Check if KV is configured
const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

// Server-side profile storage using Vercel KV (serverless-compatible)
// TODO: Replace with NestJS API calls when backend is ready
// Example: fetch(`${process.env.API_URL}/profile`)
export const profileStorageServer = {
  // Get profile
  get: async (): Promise<Profile> => {
    try {
      if (isKVConfigured()) {
        const data = await kv.get<Profile>(STORAGE_KEY);
        return data || defaultProfile;
      }
      // Fallback: use in-memory store or default for local dev
      return inMemoryProfile || defaultProfile;
    } catch (error) {
      console.error('Error reading profile from KV:', error);
      return inMemoryProfile || defaultProfile;
    }
  },

  // Update profile
  update: async (profile: Partial<Profile>): Promise<Profile> => {
    try {
      if (isKVConfigured()) {
        const current = await profileStorageServer.get();
        const updated = { ...current, ...profile };
        await kv.set(STORAGE_KEY, updated);
        return updated;
      } else {
        // Fallback: use in-memory store for local dev
        const current = inMemoryProfile || defaultProfile;
        const updated = { ...current, ...profile };
        inMemoryProfile = updated;
        return updated;
      }
    } catch (error) {
      console.error('Error updating profile in KV:', error);
      // Fallback: update in-memory store even if KV fails
      const current = inMemoryProfile || defaultProfile;
      const updated = { ...current, ...profile };
      inMemoryProfile = updated;
      return updated;
    }
  },
};
