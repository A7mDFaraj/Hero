import { Profile } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'profile.json');

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

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(STORAGE_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Server-side profile storage using JSON file
export const profileStorageServer = {
  // Get profile
  get: async (): Promise<Profile> => {
    try {
      await ensureDataDir();
      const data = await fs.readFile(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      // Return default if file doesn't exist
      return defaultProfile;
    }
  },

  // Update profile
  update: async (profile: Partial<Profile>): Promise<Profile> => {
    await ensureDataDir();
    const current = await profileStorageServer.get();
    const updated = { ...current, ...profile };
    await fs.writeFile(STORAGE_FILE, JSON.stringify(updated, null, 2));
    return updated;
  },
};
