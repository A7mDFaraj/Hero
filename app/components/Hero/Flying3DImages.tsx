'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

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
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  useEffect(() => {
    setMounted(true);
  }, []);

  // High-quality placeholder images matching the style
  const placeholderImages: ImageData[] = [
    { 
      id: 'p1', 
      url: 'https://images.unsplash.com/photo-1568605117035-2fe696e5c82c?w=1200&q=90', 
      title: 'Futuristic Car',
      kind: 'image',
    },
    { 
      id: 'p2', 
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90', 
      title: 'Abstract Art',
      kind: 'image',
    },
    { 
      id: 'p3', 
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=90', 
      title: 'Beach Scene',
      kind: 'image',
    },
    { 
      id: 'p4', 
      url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=90', 
      title: 'Space Helmet',
      kind: 'image',
    },
    { 
      id: 'p5', 
      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=90', 
      title: 'Gradient',
      kind: 'image',
    },
    { 
      id: 'p6', 
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&q=90', 
      title: 'Cityscape',
      kind: 'image',
    },
    { 
      id: 'p7', 
      url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=90', 
      title: 'Sports Car',
      kind: 'image',
    },
    // Short high-quality MP4 demo (public domain - MDN)
    {
      id: 'v1',
      url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      title: 'Short Video Demo',
      kind: 'video',
      posterUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1200&q=80',
    },
    // Animated GIF demo
    {
      id: 'g1',
      url: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
      title: 'GIF Demo',
      kind: 'gif',
    },
  ];
  
  const displayImages: ImageData[] = images.length >= 5 
    ? images.slice(0, 7) 
    : images.length > 0
      ? [...images, ...placeholderImages.slice(0, Math.max(0, 7 - images.length))]
      : placeholderImages;

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

  // Always show component, use placeholders if needed
  if (!mounted) {
    return (
      <section className="relative min-h-[600px] w-full py-12 px-4 bg-[var(--background)] z-10">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-center">
          <div className="text-[var(--purple-glow)]/60">Loading...</div>
        </div>
      </section>
    );
  }

  // Circle parameters
  const N = displayImages.length;
  const radius = 520;

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
                  />
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Circular Image Card
function CircularImageCard({
  image,
  angle,
  radius,
  width,
  height,
  depthOpacity,
  scale,
}: {
  image: ImageData;
  angle: number;
  radius: number;
  width: number;
  height: number;
  depthOpacity: number;
  scale: number;
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
      className="group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-[var(--purple-primary)]/30 bg-[var(--purple-darker)]/50 backdrop-blur-sm shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)] transition-all duration-300">
        <div className="relative w-full h-full overflow-hidden">
          {inferredKind === 'video' ? (
            <video
              src={image.url}
              poster={image.posterUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
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
