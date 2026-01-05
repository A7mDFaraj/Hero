'use client';

import Image from 'next/image';
import { Profile } from '@/types';
import SocialLinks from './SocialLinks';

interface ProfileCardProps {
  profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center px-6 py-8">
      <div className="relative mb-6 group">
        <div className="absolute inset-0 rounded-full bg-[var(--purple-primary)] blur-2xl opacity-50 animate-pulse group-hover:opacity-70 transition-opacity duration-300" />
        <div className="relative w-32 h-32 rounded-full border-4 border-[var(--purple-primary)] overflow-hidden bg-[var(--purple-darker)] group-hover:border-[var(--purple-glow)] transition-all duration-300 group-hover:scale-105">
          <Image
            src={profile.avatar}
            alt={profile.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            priority
          />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-2 purple-glow text-[var(--purple-primary)]">
        {profile.name}
      </h1>

      <div className="mb-4">
        <span
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${
            profile.twitchStatus === 'live'
              ? 'bg-red-500/20 text-red-400 border border-red-500/50 purple-glow-subtle'
              : 'bg-[var(--purple-darker)]/50 text-[var(--purple-glow)] border border-[var(--purple-primary)]/30'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              profile.twitchStatus === 'live' ? 'bg-red-500 animate-pulse' : 'bg-[var(--purple-glow)]'
            }`}
          />
          {profile.twitchStatus === 'live' ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>

      <p 
        className="text-[var(--purple-glow)]/80 text-lg max-w-md mb-6 leading-relaxed"
        dir="auto"
        style={{ 
          fontFamily: 'var(--font-sans), Arial, Helvetica, sans-serif',
          unicodeBidi: 'plaintext'
        }}
      >
        {profile.bio}
      </p>

      <SocialLinks socialLinks={profile.socialLinks} />
    </div>
  );
}
