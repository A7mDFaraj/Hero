'use client';

import { useEffect, useState } from 'react';
import HeroSection from './components/Hero/HeroSection';
import FanArtCarousel from './components/Carousel/FanArtCarousel';
import { Profile, FanArt } from '@/types';

// Mock profile data - will be replaced with API calls in Phase 2
const mockProfile: Profile = {
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

export default function Home() {
  const [fanArts, setFanArts] = useState<FanArt[]>([]);
  const [profile, setProfile] = useState<Profile>(mockProfile);

  useEffect(() => {
    // Load profile from API
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const { data } = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to default if API fails
      }
    };

    // Load fan arts from API (only active ones)
    const loadFanArts = async () => {
      try {
        const response = await fetch('/api/fanart?activeOnly=true');
        if (!response.ok) throw new Error('Failed to fetch fan arts');
        
        const { data: uploadedFanArts } = await response.json();
        setFanArts(uploadedFanArts || []);
      } catch (error) {
        console.error('Error loading fan arts:', error);
        // Set empty array if API fails
        setFanArts([]);
      }
    };

    loadProfile();
    loadFanArts();

    // Poll for updates every 5 seconds (or use WebSocket in Phase 2)
    const interval = setInterval(() => {
      loadProfile();
      loadFanArts();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen">
      <HeroSection profile={profile} />
      <FanArtCarousel fanArts={fanArts} />
    </main>
  );
}
