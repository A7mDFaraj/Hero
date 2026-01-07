'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Profile } from '@/types';
import { Twitch, Twitter, Youtube, Instagram } from 'lucide-react';

interface SocialMediaStripProps {
  socialLinks: Profile['socialLinks'];
  streamerName?: string;
}

// Custom TikTok icon component
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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  twitch: Twitch,
  twitter: Twitter,
  youtube: Youtube,
  instagram: Instagram,
  tiktok: TikTokIcon,
  discord: DiscordIcon,
};

// Extract username from URL
function getUsername(url: string, platform: string): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.replace(/^\//, '').replace(/\/$/, '');
    
    if (platform === 'twitch') {
      return path.split('/')[0] || 'Streamer';
    } else if (platform === 'twitter') {
      return path.startsWith('@') ? path : `@${path}`;
    } else if (platform === 'tiktok') {
      return path.startsWith('@') ? path : `@${path}`;
    } else if (platform === 'youtube') {
      if (path.includes('@')) return path;
      if (path.includes('channel/')) return 'Channel';
      if (path.includes('user/')) return path.split('user/')[1];
      return 'Channel';
    } else if (platform === 'instagram') {
      return path.startsWith('@') ? path : `@${path}`;
    } else if (platform === 'discord') {
      return 'Discord';
    }
    return 'Streamer';
  } catch {
    return 'Streamer';
  }
}

export default function SocialMediaStrip({ socialLinks, streamerName = 'HEROOXR' }: SocialMediaStripProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' });
  
  const links = Object.entries(socialLinks)
    .filter(([_, url]) => url)
    .map(([platform, url]) => ({
      platform,
      url,
      username: getUsername(url, platform),
      Icon: iconMap[platform] || null,
    }));
  
  if (links.length === 0) return null;
  
  // Duplicate links for seamless loop (need enough for smooth animation)
  const duplicatedLinks = [...links, ...links, ...links, ...links];

  // Calculate width of one set for seamless loop
  const itemWidth = 200; // Approximate width per item
  const totalWidth = links.length * itemWidth;

  return (
    <section 
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[var(--purple-darker)]/30 border-y-2 border-[var(--purple-primary)]/30 py-4"
    >
      <motion.div 
        className="relative flex"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Moving Strip */}
        <motion.div
          className="flex gap-6 items-center"
          animate={{
            x: [0, -totalWidth],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ width: 'max-content' }}
        >
          {duplicatedLinks.map((link, index) => {
            const Icon = link.Icon;
            return (
              <motion.a
                key={`${link.platform}-${index}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--purple-darker)]/80 backdrop-blur-sm border-2 border-[var(--purple-primary)]/50 hover:border-[var(--purple-primary)] transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] whitespace-nowrap flex-shrink-0"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {Icon && (
                  <Icon className="w-6 h-6 text-[var(--purple-glow)] flex-shrink-0" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--purple-glow)] uppercase leading-tight">
                    {link.platform}
                  </span>
                  <span className="text-xs text-[var(--purple-glow)]/70 leading-tight">
                    {link.username}
                  </span>
                </div>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Gradient Overlays for seamless effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--purple-darker)]/50 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--purple-darker)]/50 to-transparent pointer-events-none z-10" />
      </motion.div>
    </section>
  );
}
