'use client';

import { Profile } from '@/types';
import ProfileCard from './ProfileCard';

interface HeroSectionProps {
  profile: Profile;
}

export default function HeroSection({ profile }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grunge-bg">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Plus signs grid */}
        <div className="absolute top-20 right-20 w-64 h-64 opacity-20">
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className="text-[var(--purple-glow)] text-xs flex items-center justify-center"
              >
                +
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-20 left-20 w-48 h-48 opacity-15">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className="text-[var(--purple-glow)] text-xs flex items-center justify-center"
              >
                +
              </div>
            ))}
          </div>
        </div>

        {/* Scattered dots */}
        {Array.from({ length: 30 }).map((_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 2;
          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[var(--purple-glow)] rounded-full opacity-40 animate-pulse"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}

        {/* Abstract slashes */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 border-l-2 border-[var(--purple-primary)]/20 transform -rotate-45" />
          <div className="absolute top-40 right-20 w-24 h-24 border-r-2 border-[var(--purple-glow)]/20 transform rotate-12" />
          <div className="absolute bottom-32 left-1/4 w-40 h-40 border-t-2 border-[var(--purple-primary)]/15 transform rotate-45" />
          <div className="absolute bottom-20 right-1/3 w-28 h-28 border-b-2 border-[var(--purple-glow)]/20 transform -rotate-12" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
        <ProfileCard profile={profile} />
      </div>
    </section>
  );
}
