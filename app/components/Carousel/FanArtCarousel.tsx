'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { FanArt } from '@/types';
import FanArtCard from './FanArtCard';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

interface FanArtCarouselProps {
  fanArts: FanArt[];
}

export default function FanArtCarousel({ fanArts }: FanArtCarouselProps) {
  // Local placeholders so the section is always visible even without API
  const placeholderFanArts: FanArt[] = [
    {
      id: 'ph-1',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&q=80&auto=format&fit=crop',
      creatorName: 'Guest Artist',
      creatorLink: '',
      likes: 128,
      dislikes: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ph-2',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1000&q=80&auto=format&fit=crop',
      creatorName: 'Community',
      creatorLink: '',
      likes: 94,
      dislikes: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ph-3',
      image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1000&q=80&auto=format&fit=crop',
      creatorName: 'Studio',
      creatorLink: '',
      likes: 210,
      dislikes: 4,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ph-4',
      image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1000&q=80&auto=format&fit=crop',
      creatorName: 'Design Lab',
      creatorLink: '',
      likes: 77,
      dislikes: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];
  const slidesData: FanArt[] = (fanArts && fanArts.length > 0) ? fanArts : placeholderFanArts;

  const swiperRef = useRef<SwiperType | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const fallbackProgress = useMotionValue(0);
  const isInView = useInView(sectionRef, { once: false, margin: '-100px' });
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only use scroll after mount
  const scrollResult = useScroll({
    target: mounted && sectionRef.current ? sectionRef : undefined,
    offset: ['start end', 'end start'],
  });

  const scrollYProgress = mounted && sectionRef.current ? scrollResult.scrollYProgress : fallbackProgress;

  // Parallax for background layers (less intense than hero)
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const midgroundY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const particlesY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  // Animate glowing lines on canvas (simpler than hero)
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Fewer glowing lines than hero
    const lines = [
      { x1: 0.1, y1: 0.2, x2: 0.9, y2: 0.8, progress: Math.random() },
      { x1: 0.2, y1: 0.4, x2: 0.8, y2: 0.6, progress: Math.random() },
      { x1: 0.3, y1: 0.6, x2: 0.7, y2: 0.4, progress: Math.random() },
    ];

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      lines.forEach((line, i) => {
        const progress = (line.progress + time * 0.08 + i * 0.15) % 1;
        const x1 = line.x1 * canvas.width;
        const y1 = line.y1 * canvas.height;
        const x2 = line.x2 * canvas.width;
        const y2 = line.y2 * canvas.height;

        // Softer, smoother glow
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, 'rgba(167, 139, 250, 0)');
        gradient.addColorStop(0.5, `rgba(167, 139, 250, ${0.25 * (1 - Math.abs(progress - 0.5) * 2)})`);
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(167, 139, 250, 0.5)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, [mounted]);

  return (
    <section 
      ref={sectionRef}
      className="relative py-32 md:py-40 px-4 overflow-visible z-[120] min-h-[90vh] flex items-center"
      style={{ position: 'relative', zIndex: 120 }}
    >
      {/* Background Layers - Similar to hero but less intense */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* Base gradient - Slowest parallax */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[var(--purple-darker)]/40 via-[var(--purple-darker)]/30 to-[var(--purple-primary)]/20"
          style={{ y: backgroundY }}
        />
        
        {/* Animated gradient overlay - Medium parallax (less intense, smoother) */}
        <motion.div
          className="absolute inset-0"
          style={{ y: midgroundY }}
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.10) 0%, transparent 60%)',
              'radial-gradient(circle at 80% 70%, rgba(167, 139, 250, 0.10) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.10) 0%, transparent 60%)',
              'radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.10) 0%, transparent 60%)',
            ],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Glowing lines canvas - Fast parallax */}
        <motion.div
          style={{ y: foregroundY }}
          className="absolute inset-0 pointer-events-none"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ mixBlendMode: 'screen' }}
          />
        </motion.div>

        {/* Diagonal streaks - Fewer than hero */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${25 + i * 15}%`,
              top: `${15 + i * 20}%`,
              width: '150px',
              height: '1.5px',
              background: i % 2 === 0 
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(167,139,250,0.3), transparent)',
              transform: `rotate(${45 + i * 5}deg)`,
              y: midgroundY,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              x: [0, 30, 0],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.6,
            }}
          />
        ))}

        {/* Soft vignette dots removed for smoother background */}

        {/* Glowing particles - Fewer and softer */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[var(--purple-glow)]/80 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 6px var(--purple-glow), 0 0 12px var(--purple-glow)',
              y: particlesY,
            }}
            animate={{
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.5, 1],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Grain texture overlay removed for smoother look */}
      </div>

      <motion.div 
        className="max-w-7xl mx-auto relative z-10 w-full"
        initial={{ opacity: 0, y: 100 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[var(--purple-darker)]/60 border border-[var(--purple-primary)]/40 backdrop-blur-md"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-[var(--purple-glow)]" />
            <span className="text-xs tracking-widest text-[var(--purple-glow)]/90 uppercase">
              Community Highlights
            </span>
          </motion.div>

          <motion.h2 
            className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            <span className="bg-gradient-to-r from-[var(--purple-primary)] via-[var(--purple-glow)] to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(124,58,237,0.35)]">
              Fan Art Gallery
            </span>
          </motion.h2>

          <motion.div
            className="mx-auto mt-4 h-1 w-36 rounded-full bg-gradient-to-r from-transparent via-[var(--purple-primary)] to-transparent"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ delay: 0.35, duration: 0.5 }}
          />
        </div>

        <div className="relative">
          <style dangerouslySetInnerHTML={{ __html: `
            .fanart-swiper { overflow: visible !important; }
            .fanart-swiper .swiper-wrapper { overflow: visible !important; }
            .fanart-swiper .swiper-slide {
              transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
            }
            .fanart-swiper .swiper-slide-active {
              transform: scale(1.15) !important;
              z-index: 10 !important;
            }
            .fanart-swiper .swiper-slide-active .group {
              border-color: var(--purple-primary) !important;
              box-shadow: 0 0 40px rgba(124, 58, 237, 0.6), 0 0 80px rgba(124, 58, 237, 0.4) !important;
              animation: fanart-float 3s ease-in-out infinite;
            }
            /* AI scan overlay on active card */
            .fanart-swiper .swiper-slide-active .group .ai-scan {
              opacity: 1 !important;
              animation: ai-scan-move 2.8s linear infinite;
            }
            @keyframes ai-scan-move {
              0% { transform: translateY(100%); }
              100% { transform: translateY(-100%); }
            }
            .fanart-swiper .swiper-slide:not(.swiper-slide-active) .group {
              transform: translateY(0);
            }
            /* Futuristic halo behind active card */
            .fanart-swiper .swiper-slide-active .group::before {
              content: '';
              position: absolute;
              inset: -12px;
              border-radius: 16px;
              background: radial-gradient(circle at 50% 50%, rgba(124,58,237,0.35), rgba(124,58,237,0.15) 40%, transparent 65%);
              filter: blur(22px);
              z-index: -1;
              animation: fanart-halo 2.4s ease-in-out infinite;
            }
            .fanart-swiper .swiper-slide:not(.swiper-slide-active) {
              opacity: 0.7;
            }
            .fanart-swiper .swiper-slide-prev,
            .fanart-swiper .swiper-slide-next {
              opacity: 0.85;
            }
            @keyframes fanart-float {
              0%, 100% { transform: translateY(-4px); }
              50% { transform: translateY(-10px); }
            }
            @keyframes fanart-halo {
              0%, 100% { opacity: 0.25; transform: scale(0.98); }
              50% { opacity: 0.55; transform: scale(1.02); }
            }
          `}} />
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 12,
              stretch: 0,
              depth: 300,
              modifier: 1.25,
              slideShadows: true,
            }}
            spaceBetween={40}
            breakpoints={{
              640: {
                spaceBetween: 30,
              },
              1024: {
                spaceBetween: 40,
              },
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={slidesData.length > 3}
            pagination={{
              clickable: true,
              bulletClass: 'swiper-pagination-bullet-purple',
            }}
            navigation={false}
            className="!pt-8 !pb-24 fanart-swiper"
          >
            {slidesData.map((fanArt) => (
              <SwiperSlide key={fanArt.id} className="!w-[280px] md:!w-[380px] lg:!w-[480px]">
                <FanArtCard fanArt={fanArt} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation - Larger and more prominent */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-20 w-14 h-14 md:w-16 md:h-16 rounded-full bg-[var(--purple-darker)]/90 backdrop-blur-md border-2 border-[var(--purple-primary)]/60 hover:border-[var(--purple-primary)] hover:bg-[var(--purple-primary)]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.7)]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-7 h-7 md:w-8 md:h-8 text-[var(--purple-glow)] group-hover:text-[var(--purple-primary)] transition-colors" />
          </button>

          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-20 w-14 h-14 md:w-16 md:h-16 rounded-full bg-[var(--purple-darker)]/90 backdrop-blur-md border-2 border-[var(--purple-primary)]/60 hover:border-[var(--purple-primary)] hover:bg-[var(--purple-primary)]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.7)]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-7 h-7 md:w-8 md:h-8 text-[var(--purple-glow)] group-hover:text-[var(--purple-primary)] transition-colors" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
