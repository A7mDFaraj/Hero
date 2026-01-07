'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Volume2, VolumeX } from 'lucide-react';

interface ImageData {
  id: string;
  url: string;
  title?: string;
  kind?: 'image' | 'video' | 'gif';
  posterUrl?: string;
}

interface Flying3DImagesProps {
  images: ImageData[];
  title?: string;
  subtitle?: string;
}

export default function Flying3DImages({ images, title, subtitle }: Flying3DImagesProps) {
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);
  const [rotation, setRotation] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<ImageData | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedVideo) {
        setSelectedVideo(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedVideo]);

  // Use only uploaded images - no placeholders
  // If no images, show empty state or hide section
  const displayImages: ImageData[] = images;

  // Continuous rotation loop for circular carousel
  useEffect(() => {
    let raf: number;
    const tick = () => {
      // Slow when not visible; pause on hover
      const speed = isHoveringRef.current ? 0.0005 : (isInView ? 0.0015 : 0.0006);
      setRotation((prev) => (prev + speed) % (Math.PI * 2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView]);

  if (!mounted) {
    return (
      <section className="relative min-h-[600px] w-full py-12 px-4 bg-[var(--background)] z-10">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-center">
          <div className="text-[var(--purple-glow)]/60">Loading...</div>
        </div>
      </section>
    );
  }

  // Circle parameters - adjust radius based on number of images for better spacing
  const N = displayImages.length;
  // Dynamic radius: more images = smaller radius, fewer images = larger radius (more gap)
  // Minimum 3 items: radius 520, scales up for fewer items
  const baseRadius = 520;
  const minItems = 3;
  const radius = N < minItems 
    ? baseRadius + (minItems - N) * 80  // Increase radius by 80px for each missing item
    : baseRadius;

  // Don't render section if no images
  if (displayImages.length === 0) {
    return null;
  }

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[600px] w-full py-12 px-4 bg-[var(--background)] overflow-hidden z-20"
      style={{ position: 'relative', zIndex: 20 }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-[var(--purple-primary)]/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto flex flex-col">
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-12"
          >
            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.2 }}
                className="text-[var(--purple-glow)]/60 text-xs uppercase tracking-wider mb-2"
              >
                {subtitle}
              </motion.p>
            )}
            {title && (
              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                className="text-3xl md:text-5xl font-bold purple-glow text-[var(--purple-primary)]"
              >
                {title}
              </motion.h2>
            )}
          </motion.div>
        )}

        {/* Circular 3D Looping Carousel */}
        <div className="flex-1 flex items-center justify-center relative overflow-visible">
          <motion.div
            ref={containerRef}
            className="relative h-[520px] w-full"
            style={{ perspective: '1400px' }}
          >
            <div
              ref={ringRef}
              onMouseEnter={() => { isHoveringRef.current = true; }}
              onMouseLeave={() => { isHoveringRef.current = false; }}
              className="absolute inset-0"
              style={{
                transformStyle: 'preserve-3d',
                transform: `translateZ(-250px) rotateY(${rotation}rad)`,
              }}
            >
              {displayImages.map((image, index) => {
                const angle = (index / N) * Math.PI * 2;
                const width = 520;
                const height = 360;
                const isFront = Math.cos(angle + rotation) > 0;
                const depthOpacity = 0.35 + 0.65 * (isFront ? 1 : 0.6);
                const scale = 0.8 + 0.2 * (isFront ? 1 : 0.8);

                return (
                  <CircularImageCard
                    key={image.id}
                    image={image}
                    angle={angle}
                    radius={radius}
                    width={width}
                    height={height}
                    depthOpacity={depthOpacity}
                    scale={scale}
                    onVideoClick={(img) => setSelectedVideo(img)}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal - Fullscreen with sound */}
      <AnimatePresence>
        {selectedVideo && selectedVideo.kind === 'video' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                ref={videoRef}
                src={selectedVideo.url}
                poster={selectedVideo.posterUrl}
                autoPlay
                controls
                muted={isMuted}
                className="w-full h-full object-contain"
                onEnded={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                  }
                }}
              />
              
              {/* Close Button */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.pause();
                    videoRef.current.currentTime = 0;
                  }
                  setSelectedVideo(null);
                  setIsMuted(false);
                }}
                className="absolute top-4 right-4 z-10 p-3 bg-black/70 hover:bg-black/90 rounded-full transition-all duration-300 hover:scale-110"
                aria-label="Close video"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Mute/Unmute Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 left-4 z-10 p-3 bg-black/70 hover:bg-black/90 rounded-full transition-all duration-300 hover:scale-110"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Video Title */}
              {selectedVideo.title && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="text-white text-xl font-bold bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm">
                    {selectedVideo.title}
                  </h3>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Circular Image Card
// Recommended sizes for uploads:
// - Images: 1920x1080 (16:9) or 1920x1333 (3:2) - will be displayed at 520x360px
// - Videos: 1920x1080 (16:9) recommended - MP4 format, max 100MB
// - GIFs: 1920x1080 or smaller for better performance
function CircularImageCard({
  image,
  angle,
  radius,
  width,
  height,
  depthOpacity,
  scale,
  onVideoClick,
}: {
  image: ImageData;
  angle: number;
  radius: number;
  width: number;
  height: number;
  depthOpacity: number;
  scale: number;
  onVideoClick?: (image: ImageData) => void;
}) {
  const transform = `rotateY(${angle}rad) translateZ(${radius}px) scale(${scale})`;
  // Infer media kind if not explicitly provided
  const lowerUrl = image.url.toLowerCase();
  const inferredKind: 'image' | 'video' | 'gif' =
    image.kind ||
    (lowerUrl.endsWith('.mp4') || lowerUrl.endsWith('.webm') ? 'video'
    : lowerUrl.endsWith('.gif') ? 'gif'
    : 'image');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: `-${width / 2}px`,
        marginTop: `-${height / 2}px`,
        width: `${width}px`,
        height: `${height}px`,
        transformStyle: 'preserve-3d',
        transform,
      }}
      className={`group ${inferredKind === 'video' ? 'cursor-pointer' : ''}`}
      onClick={() => {
        if (inferredKind === 'video' && onVideoClick) {
          onVideoClick(image);
        }
      }}
    >
      {/* Image Container */}
      <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-[var(--purple-primary)]/30 bg-[var(--purple-darker)]/50 backdrop-blur-sm shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all duration-300">
        <div className="relative w-full h-full overflow-hidden">
          {inferredKind === 'video' ? (
            <>
              <video
                src={image.url}
                poster={image.posterUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Play Button Overlay for Videos */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all duration-300">
                <div className="w-20 h-20 rounded-full bg-[var(--purple-primary)]/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(124,58,237,0.8)]">
                  <svg
                    className="w-10 h-10 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm font-semibold bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Click to play with sound
                </p>
              </div>
            </>
          ) : inferredKind === 'gif' ? (
            <img
              src={image.url}
              alt={image.title || 'GIF'}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Image
              src={image.url}
              alt={image.title || `Image`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes={`${width}px`}
              unoptimized
            />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--purple-darker)]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Subtle border glow based on depth */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-[var(--purple-primary)]/40 pointer-events-none"
          animate={{
            boxShadow: [
              `0 0 30px rgba(124, 58, 237, ${0.25 * depthOpacity})`,
              `0 0 50px rgba(124, 58, 237, ${0.45 * depthOpacity})`,
              `0 0 30px rgba(124, 58, 237, ${0.25 * depthOpacity})`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {/* Depth Glow */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-[var(--purple-primary)]/20 blur-2xl -z-10 pointer-events-none"
        style={{
          opacity: depthOpacity * 0.7,
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [depthOpacity * 0.6, depthOpacity * 0.85, depthOpacity * 0.6],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}
