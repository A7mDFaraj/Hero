export interface Profile {
  name: string;
  bio: string;
  avatar: string;
  twitchStatus: 'live' | 'offline';
  mainText?: string; // Main hero text (defaults to name if not set)
  subtitle?: string; // Subtitle text below main text
  featuredWorksTitle?: string; // Title for Featured Works section
  featuredWorksSubtitle?: string; // Subtitle for Featured Works section
  socialLinks: {
    twitch?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    instagram?: string;
    discord?: string;
  };
}

export interface FeaturedWork {
  id: string;
  url: string;
  title?: string;
  kind: 'image' | 'video' | 'gif';
  posterUrl?: string; // For video thumbnails
  isActive?: boolean;
  createdAt?: string;
}

export interface FanArt {
  id: string;
  image: string;
  creatorName: string;
  creatorLink?: string;
  adminRating?: number; // Admin's rating (1-5 stars)
  likes: number; // Visitor likes count
  dislikes: number; // Visitor dislikes count
  createdAt?: string;
  isActive?: boolean; // Whether to show in carousel (default: true)
}
