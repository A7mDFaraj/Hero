import { FanArt } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'fanart.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(STORAGE_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Server-side storage using JSON file
export const fanArtStorageServer = {
  // Get all fan arts
  getAll: async (): Promise<FanArt[]> => {
    try {
      await ensureDataDir();
      const data = await fs.readFile(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
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

    await ensureDataDir();
    const all = await fanArtStorageServer.getAll();
    all.push(newFanArt);
    await fs.writeFile(STORAGE_FILE, JSON.stringify(all, null, 2));
    
    return newFanArt;
  },

  // Update fan art
  update: async (id: string, updates: Partial<FanArt>): Promise<FanArt> => {
    await ensureDataDir();
    const all = await fanArtStorageServer.getAll();
    const index = all.findIndex((art) => art.id === id);
    
    if (index === -1) {
      throw new Error('Fan art not found');
    }
    
    const updated = { ...all[index], ...updates };
    all[index] = updated;
    await fs.writeFile(STORAGE_FILE, JSON.stringify(all, null, 2));
    
    return updated;
  },

  // Delete fan art
  delete: async (id: string): Promise<void> => {
    await ensureDataDir();
    const all = await fanArtStorageServer.getAll();
    const filtered = all.filter((art) => art.id !== id);
    await fs.writeFile(STORAGE_FILE, JSON.stringify(filtered, null, 2));
  },
};
