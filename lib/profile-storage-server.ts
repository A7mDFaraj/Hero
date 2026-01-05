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

// Server-side profile storage using Vercel KV (serverless-compatible)
// TODO: Replace with NestJS API calls when backend is ready
// Example: fetch(`${process.env.API_URL}/profile`)
export const profileStorageServer = {
  // Get profile
  get: async (): Promise<Profile> => {
    try {
      // Check if KV is configured (for Vercel deployment)
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const data = await kv.get<Profile>(STORAGE_KEY);
        return data || defaultProfile;
      }
      // Fallback: return default if KV not configured (local dev)
      return defaultProfile;
    } catch (error) {
      console.error('Error reading profile from KV:', error);
      return defaultProfile;
    }
  },

  // Update profile
  update: async (profile: Partial<Profile>): Promise<Profile> => {
    try {
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const current = await profileStorageServer.get();
        const updated = { ...current, ...profile };
        await kv.set(STORAGE_KEY, updated);
        return updated;
      }
      // If KV not configured, merge with default and return (for local dev/testing)
      return { ...defaultProfile, ...profile };
    } catch (error) {
      console.error('Error updating profile in KV:', error);
      throw new Error('Failed to update profile');
    }
  },
};
