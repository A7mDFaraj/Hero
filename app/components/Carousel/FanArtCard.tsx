'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ThumbsUp, ThumbsDown, Star, ExternalLink } from 'lucide-react';
import { FanArt } from '@/types';

interface FanArtCardProps {
  fanArt: FanArt;
}

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%234C1D95" width="400" height="300"/%3E%3Ctext fill="%23A78BFA" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';

export default function FanArtCard({ fanArt }: FanArtCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(fanArt.image);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [likes, setLikes] = useState(fanArt.likes || 0);
  const [dislikes, setDislikes] = useState(fanArt.dislikes || 0);

  useEffect(() => {
    // Check if user has already voted (stored in localStorage)
    const storageKey = `fanart_vote_${fanArt.id}`;
    const savedVote = localStorage.getItem(storageKey);
    if (savedVote === 'like' || savedVote === 'dislike') {
      setUserVote(savedVote);
    }
  }, [fanArt.id]);

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(FALLBACK_IMAGE);
    }
  };

  const handleVote = async (voteType: 'like' | 'dislike') => {
    const storageKey = `fanart_vote_${fanArt.id}`;
    const currentVote = localStorage.getItem(storageKey);

    // If clicking the same vote, remove it
    if (currentVote === voteType) {
      localStorage.removeItem(storageKey);
      setUserVote(null);
      if (voteType === 'like') {
        setLikes((prev) => Math.max(0, prev - 1));
      } else {
        setDislikes((prev) => Math.max(0, prev - 1));
      }
      // Note: API doesn't handle vote removal yet - will be added in Phase 2
      return;
    }

    // If switching from one vote to another
    if (currentVote && currentVote !== voteType) {
      if (currentVote === 'like') {
        setLikes((prev) => Math.max(0, prev - 1));
      } else {
        setDislikes((prev) => Math.max(0, prev - 1));
      }
    }

    // Save new vote
    localStorage.setItem(storageKey, voteType);
    setUserVote(voteType);

    // Update counts
    if (voteType === 'like') {
      setLikes((prev) => prev + (currentVote === 'dislike' ? 1 : 1));
      if (currentVote === 'dislike') {
        setDislikes((prev) => Math.max(0, prev - 1));
      }
    } else {
      setDislikes((prev) => prev + (currentVote === 'like' ? 1 : 1));
      if (currentVote === 'like') {
        setLikes((prev) => Math.max(0, prev - 1));
      }
    }

    // Update on server
    try {
      const response = await fetch(`/api/fanart/${fanArt.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });
      
      if (response.ok) {
        const { data } = await response.json();
        setLikes(data.likes || 0);
        setDislikes(data.dislikes || 0);
      }
    } catch (error) {
      console.error('Failed to update vote:', error);
      // Revert on error
      if (voteType === 'like') {
        setLikes((prev) => prev - 1);
        if (currentVote === 'dislike') {
          setDislikes((prev) => prev + 1);
        }
      } else {
        setDislikes((prev) => prev - 1);
        if (currentVote === 'like') {
          setLikes((prev) => prev + 1);
        }
      }
    }
  };

  return (
    <div className="group relative h-full w-full rounded-xl overflow-hidden bg-[var(--purple-darker)]/50 border border-[var(--purple-primary)]/30 hover:border-[var(--purple-primary)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]">
      <div className="relative h-80 w-full overflow-hidden">
        {imageSrc.startsWith('data:') || imageError ? (
          // For base64 images (localStorage) or error fallback, use regular img tag
          <img
            src={imageSrc}
            alt={`Fan art by ${fanArt.creatorName}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={handleImageError}
          />
        ) : (
          // For external URLs, use Next.js Image with unoptimized for better error handling
          <Image
            src={imageSrc}
            alt={`Fan art by ${fanArt.creatorName}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={false}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--purple-darker)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {fanArt.creatorLink ? (
              <a
                href={fanArt.creatorLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--purple-glow)] hover:text-[var(--purple-primary)] transition-colors font-semibold flex items-center gap-1"
              >
                {fanArt.creatorName}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-[var(--purple-glow)] font-semibold">{fanArt.creatorName}</span>
            )}
          </div>

          {fanArt.adminRating && (
            <div className="flex items-center gap-1" title="Admin Rating">
              <Star className="w-4 h-4 fill-[var(--purple-primary)] text-[var(--purple-primary)]" />
              <span className="text-[var(--purple-glow)] text-sm font-medium">{fanArt.adminRating}</span>
            </div>
          )}
        </div>

        {/* Like/Dislike Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => handleVote('like')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
              userVote === 'like'
                ? 'bg-[var(--purple-primary)]/30 border border-[var(--purple-primary)] text-[var(--purple-primary)]'
                : 'bg-[var(--purple-darker)]/30 border border-[var(--purple-primary)]/20 text-[var(--purple-glow)]/70 hover:border-[var(--purple-primary)]/50 hover:text-[var(--purple-glow)]'
            }`}
            aria-label="Like this fan art"
          >
            <ThumbsUp className={`w-4 h-4 ${userVote === 'like' ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likes}</span>
          </button>
          <button
            onClick={() => handleVote('dislike')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
              userVote === 'dislike'
                ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                : 'bg-[var(--purple-darker)]/30 border border-[var(--purple-primary)]/20 text-[var(--purple-glow)]/70 hover:border-red-500/30 hover:text-red-400'
            }`}
            aria-label="Dislike this fan art"
          >
            <ThumbsDown className={`w-4 h-4 ${userVote === 'dislike' ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{dislikes}</span>
          </button>
        </div>

        {fanArt.createdAt && (
          <p className="text-[var(--purple-glow)]/60 text-xs">
            {new Date(fanArt.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
