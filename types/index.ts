export interface Profile {
  name: string;
  bio: string;
  avatar: string;
  twitchStatus: 'live' | 'offline';
  socialLinks: {
    twitch?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    instagram?: string;
    discord?: string;
  };
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
