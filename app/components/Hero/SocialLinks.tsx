'use client';

import { ExternalLink, Twitch, Twitter, Youtube, Instagram } from 'lucide-react';
import { Profile } from '@/types';

interface SocialLinksProps {
  socialLinks: Profile['socialLinks'];
}

// Custom TikTok icon component (Lucide doesn't have a TikTok icon)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Custom Discord icon component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const iconMap = {
  twitch: Twitch,
  twitter: Twitter,
  youtube: Youtube,
  instagram: Instagram,
  tiktok: TikTokIcon,
  discord: DiscordIcon,
};

export default function SocialLinks({ socialLinks }: SocialLinksProps) {
  const links = Object.entries(socialLinks).filter(([_, url]) => url);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
      {links.map(([platform, url]) => {
        const Icon = iconMap[platform as keyof typeof iconMap] || ExternalLink;
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 hover:border-[var(--purple-primary)] hover:bg-[var(--purple-primary)]/20 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]"
            aria-label={`Visit ${platform} profile`}
          >
            <Icon className="w-5 h-5 text-[var(--purple-glow)] group-hover:text-[var(--purple-primary)] transition-colors" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs text-[var(--purple-glow)] transition-opacity whitespace-nowrap">
              {platform}
            </span>
          </a>
        );
      })}
    </div>
  );
}
