'use client';

import { useEffect, useState } from 'react';
import FuturisticHero from './components/Hero/FuturisticHero';
import SocialMediaStrip from './components/Hero/SocialMediaStrip';
import Flying3DImages from './components/Hero/Flying3DImages';
import FanArtCarousel from './components/Carousel/FanArtCarousel';
import { Profile, FanArt, FeaturedWork } from '@/types';

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
  const [featuredWorks, setFeaturedWorks] = useState<FeaturedWork[]>([]);
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

    // Load featured works from API (only active ones)
    const loadFeaturedWorks = async () => {
      try {
        const response = await fetch('/api/featured-works?activeOnly=true');
        if (!response.ok) throw new Error('Failed to fetch featured works');
        
        const { data } = await response.json();
        setFeaturedWorks(data || []);
      } catch (error) {
        console.error('Error loading featured works:', error);
        setFeaturedWorks([]);
      }
    };

    loadProfile();
    loadFanArts();
    loadFeaturedWorks();

    // Poll for updates every 5 seconds (or use WebSocket in Phase 2)
    const interval = setInterval(() => {
      loadProfile();
      loadFanArts();
      loadFeaturedWorks();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Transform featured works for 3D gallery
  type ImageData = {
    id: string;
    url: string;
    title?: string;
    kind?: 'image' | 'video' | 'gif';
    posterUrl?: string;
  };

  const galleryImages: ImageData[] = featuredWorks.length > 0
    ? featuredWorks.map((work) => ({
        id: work.id,
        url: work.url,
        title: work.title,
        kind: work.kind as 'image' | 'video' | 'gif',
        posterUrl: work.posterUrl,
      }))
    : [];

  // If no featured works, use placeholder images
  const displayImages: ImageData[] = galleryImages.length > 0 
    ? galleryImages 
    : [
        { id: '1', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', title: 'Gaming', kind: 'image' as const },
        { id: '2', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', title: 'Streaming', kind: 'image' as const },
        { id: '3', url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400', title: 'Community', kind: 'image' as const },
        { id: '4', url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400', title: 'Gaming Setup', kind: 'image' as const },
      ];

  return (
    <main className="min-h-screen">
      <FuturisticHero profile={profile} />
      <SocialMediaStrip socialLinks={profile.socialLinks} streamerName={profile.name} />
      <Flying3DImages 
        images={displayImages} 
        title={profile.featuredWorksTitle || "Featured Works"}
        subtitle={profile.featuredWorksSubtitle || "© Digital Showcase"}
      />
      <FanArtCarousel fanArts={fanArts} />
    </main>
  );
}
