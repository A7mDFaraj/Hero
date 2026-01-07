'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useInView } from 'framer-motion';
import { Profile } from '@/types';

interface FuturisticHeroProps {
  profile: Profile;
}

export default function FuturisticHero({ profile }: FuturisticHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'intro' | 'settled' | 'complete'>('intro');
  const [nameAnimations, setNameAnimations] = useState<Array<{ x: number; rotate: number }>>([]);
  const [arabicAnimations, setArabicAnimations] = useState<Array<{ x: number; rotate: number }>>([]);
  const [isHovered, setIsHovered] = useState(false);
  const fallbackProgress = useMotionValue(0);
  const badgeRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const [badgePosition, setBadgePosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [notePosition, setNotePosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  // Only use scroll after mount
  const scrollResult = useScroll({
    target: mounted && containerRef.current ? containerRef : undefined,
    offset: ['start start', 'end start'],
  });

  const scrollYProgress = mounted && containerRef.current ? scrollResult.scrollYProgress : fallbackProgress;

  // Parallax transforms for different layers
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const midgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const particlesY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const shapesY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  // Only show the intro overlay when the hero section is in view
  const isHeroInView = useInView(containerRef, { amount: 0.3 });

  useEffect(() => {
    setMounted(true);
    
    // Generate random values for name animations (client-side only)
    const mainText = profile.mainText || profile.name;
    const nameChars = mainText.split('');
    setNameAnimations(
      nameChars.map(() => ({
        x: Math.random() * 200 - 100,
        rotate: Math.random() * 360,
      }))
    );

    // Generate random values for Arabic text animations (client-side only)
    const arabicText = 'حياكم الله ياحلوين في البث';
    setArabicAnimations(
      arabicText.split('').map(() => ({
        x: (Math.random() - 0.5) * 300,
        rotate: (Math.random() - 0.5) * 720,
      }))
    );

    // Animation sequence
    const timer1 = setTimeout(() => {
      setAnimationPhase('settled');
    }, nameChars.length * 150 + 2000);

    const timer2 = setTimeout(() => {
      setAnimationPhase('complete');
    }, nameChars.length * 150 + 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [profile.mainText, profile.name]);

  // Update badge and note positions for arrow calculation
  useEffect(() => {
    const updatePositions = () => {
      if (badgeRef.current) {
        const rect = badgeRef.current.getBoundingClientRect();
        setBadgePosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        });
      }
      
      if (noteRef.current) {
        const rect = noteRef.current.getBoundingClientRect();
        setNotePosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);

    // Update after a delay to ensure elements are rendered
    const timer = setTimeout(updatePositions, 2000);
    const timer2 = setTimeout(updatePositions, 3000);

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [profile.twitchStatus, mounted]);

  // Animate glowing lines on canvas with parallax
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Glowing lines data
    const lines = [
      { x1: 0.1, y1: 0.1, x2: 0.9, y2: 0.9, progress: Math.random() },
      { x1: 0.2, y1: 0.3, x2: 0.8, y2: 0.7, progress: Math.random() },
      { x1: 0.3, y1: 0.5, x2: 0.7, y2: 0.3, progress: Math.random() },
      { x1: 0.1, y1: 0.7, x2: 0.9, y2: 0.2, progress: Math.random() },
      { x1: 0.4, y1: 0.2, x2: 0.6, y2: 0.8, progress: Math.random() },
    ];

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw glowing lines
      lines.forEach((line, i) => {
        const progress = (line.progress + time * 0.1 + i * 0.2) % 1;
        const x1 = line.x1 * canvas.width;
        const y1 = line.y1 * canvas.height;
        const x2 = line.x2 * canvas.width;
        const y2 = line.y2 * canvas.height;

        // Create gradient for glow
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, 'rgba(167, 139, 250, 0)');
        gradient.addColorStop(0.5, `rgba(167, 139, 250, ${0.8 * (1 - Math.abs(progress - 0.5) * 2)})`);
        gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(167, 139, 250, 1)';
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
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-[var(--background)]"
    >
      {/* Parallax Background Layers */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        {/* Base gradient - Slowest parallax */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-black via-[var(--purple-darker)] to-[var(--purple-primary)]"
          style={{ y: backgroundY }}
        />
        
        {/* Animated gradient overlay - Medium parallax */}
        <motion.div
          className="absolute inset-0"
          style={{ y: midgroundY }}
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.5) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(167, 139, 250, 0.5) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.5) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.5) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Glowing lines canvas - Fast parallax */}
        <motion.div
          style={{ y: foregroundY }}
          className="absolute inset-0"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ mixBlendMode: 'screen' }}
          />
        </motion.div>

        {/* Torn paper shapes - Top Left - Fast parallax */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96"
          style={{ y: shapesY }}
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <path
              d="M0,0 L400,50 L380,200 L200,350 L50,300 L0,150 Z"
              fill="rgba(124, 58, 237, 0.6)"
              className="drop-shadow-[0_0_20px_rgba(124,58,237,0.8)]"
            />
            <path
              d="M50,50 L350,80 L330,180 L180,280 L80,250 L50,120 Z"
              fill="rgba(167, 139, 250, 0.4)"
              className="drop-shadow-[0_0_15px_rgba(167,139,250,0.6)]"
            />
          </svg>
        </motion.div>

        {/* Torn paper shapes - Bottom Right - Fast parallax */}
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96"
          style={{ y: shapesY }}
          animate={{
            x: [0, -10, 0],
            y: [0, 10, 0],
            rotate: [0, -2, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <path
              d="M400,400 L0,350 L20,200 L200,50 L350,100 L400,250 Z"
              fill="rgba(124, 58, 237, 0.6)"
              className="drop-shadow-[0_0_20px_rgba(124,58,237,0.8)]"
            />
            <path
              d="M350,350 L50,320 L70,220 L220,120 L320,150 L350,280 Z"
              fill="rgba(167, 139, 250, 0.4)"
              className="drop-shadow-[0_0_15px_rgba(167,139,250,0.6)]"
            />
          </svg>
        </motion.div>

        {/* Diagonal streaks - Medium parallax */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${20 + i * 10}%`,
              top: `${10 + i * 12}%`,
              width: '200px',
              height: '2px',
              background: i % 2 === 0 
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)',
              transform: `rotate(${45 + i * 5}deg)`,
              y: midgroundY,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              x: [0, 50, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Plus signs grid - Top Right - Slow parallax */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64"
          style={{ y: backgroundY }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          <div className="grid grid-cols-6 gap-4 h-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                className="text-white text-xl flex items-center justify-center"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              >
                +
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Plus signs grid - Bottom Left - Slow parallax */}
        <motion.div
          className="absolute bottom-20 left-20 w-48 h-48"
          style={{ y: backgroundY }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          <div className="grid grid-cols-5 gap-3 h-full">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="text-white text-lg flex items-center justify-center"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              >
                +
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Glowing particles - Fastest parallax */}
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[var(--purple-glow)] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: '0 0 15px var(--purple-glow), 0 0 30px var(--purple-glow)',
              y: particlesY,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 2, 1],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Grain texture overlay - No parallax */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Dark overlay for text readability - Reduced opacity to show more */}
        <div className="absolute inset-0 bg-[var(--background)]/10" />
      </div>

      {/* Profile Avatar - Top Left - ALWAYS VISIBLE */}
      <motion.div
        initial={{ opacity: 0, x: -100, y: -100 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, delay: 0.5, type: 'spring', stiffness: 100 }}
        className="fixed top-8 left-8 z-[100] flex items-center gap-4"
        style={{ position: 'fixed' }}
      >
        <motion.div
          className="relative"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-[var(--purple-primary)] blur-2xl opacity-50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-[var(--purple-primary)] overflow-hidden bg-[var(--purple-darker)] shadow-[0_0_30px_rgba(124,58,237,0.6)]">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content - Above Background - Parallax fade on scroll (only when in view) */}
      {isHeroInView && (
      <motion.div
        style={{ 
          opacity,
          scale, 
          y,
          position: 'fixed', 
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          width: '100%',
          height: '100vh',
        }}
        className="flex flex-col items-center justify-center px-4"
      >
        {/* Streamer Name - Main Title - Takes Full Hero Section */}
        {mounted && nameAnimations.length > 0 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 100, position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, right: 0, bottom: 0 }}
            animate={{
              scale: animationPhase === 'intro' ? 1 : (animationPhase === 'settled' || animationPhase === 'complete' ? 0.7 : 1),
              y: animationPhase === 'intro' ? 0 : (animationPhase === 'settled' || animationPhase === 'complete' ? -120 : 0),
            }}
            transition={{
              duration: 1.5,
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
          >
            <motion.h1
              className="text-8xl md:text-[12rem] lg:text-[16rem] xl:text-[18rem] font-black text-center leading-none select-none cursor-pointer"
              initial={{ opacity: 1 }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{ 
                textShadow: '0 0 80px var(--purple-primary), 0 0 160px var(--purple-primary), 0 0 240px var(--purple-primary), 0 0 320px var(--purple-primary)',
                zIndex: 100,
                position: 'relative',
                pointerEvents: 'auto',
                color: '#A78BFA',
                WebkitTextStroke: '4px #7C3AED',
                WebkitTextFillColor: '#A78BFA',
                filter: 'drop-shadow(0 0 40px #7C3AED)',
                opacity: 1,
              }}
              animate={{
                opacity: 1,
                textShadow: isHovered && (animationPhase === 'settled' || animationPhase === 'complete')
                  ? [
                      '0 0 80px var(--purple-primary), 0 0 160px var(--purple-primary), 0 0 240px var(--purple-primary), 0 0 320px var(--purple-primary)',
                      '0 0 100px var(--purple-primary), 0 0 200px var(--purple-primary), 0 0 300px var(--purple-primary), 0 0 400px var(--purple-primary)',
                      '0 0 80px var(--purple-primary), 0 0 160px var(--purple-primary), 0 0 240px var(--purple-primary), 0 0 320px var(--purple-primary)',
                    ]
                  : '0 0 60px var(--purple-primary), 0 0 120px var(--purple-primary), 0 0 180px var(--purple-primary), 0 0 240px var(--purple-primary)',
                scale: isHovered && (animationPhase === 'settled' || animationPhase === 'complete') ? 1.05 : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: isHovered && (animationPhase === 'settled' || animationPhase === 'complete') ? Infinity : 0,
              }}
            >
              {(profile.mainText || profile.name).split('').map((char, i) => {
                const anim = nameAnimations[i] || { x: 0, rotate: 0 };
                return (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{
                      opacity: 0,
                      y: -200,
                      x: anim.x,
                      rotate: anim.rotate,
                      scale: 0,
                    }}
                    animate={{
                      opacity: animationPhase === 'intro' ? [0, 1] : 1,
                      y: animationPhase === 'settled' || animationPhase === 'complete' ? 0 : -30,
                      x: 0,
                      rotate: animationPhase === 'settled' || animationPhase === 'complete' ? 0 : 360,
                      scale: animationPhase === 'settled' || animationPhase === 'complete' 
                        ? (isHovered ? [1, 1.1, 1] : 1)
                        : [0, 1.8],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      type: animationPhase === 'settled' || animationPhase === 'complete' ? 'tween' : 'tween',
                      ease: animationPhase === 'settled' || animationPhase === 'complete' 
                        ? (isHovered ? 'easeInOut' : 'easeOut')
                        : 'easeInOut',
                      repeat: isHovered && (animationPhase === 'settled' || animationPhase === 'complete') ? Infinity : 0,
                      repeatDelay: 0.1,
                    }}
                    whileHover={animationPhase === 'settled' || animationPhase === 'complete' ? {
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                      transition: {
                        duration: 0.6,
                        repeat: Infinity,
                      }
                    } : {}}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                );
              })}
            </motion.h1>
          </motion.div>
        )}

        {/* Subtitle and Status - Parallax fade on scroll */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="fixed bottom-32 md:bottom-40 left-1/2 -translate-x-1/2 text-center w-full px-4"
          style={{ 
            zIndex: 110, 
            position: 'fixed', 
            pointerEvents: 'none', 
            width: '100%', 
            maxWidth: '100vw',
            opacity,
          }}
        >
            {/* Subtitle Text - Rendered as whole text for proper Arabic connection */}
            {profile.subtitle && (
              <motion.h2
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
                dir="auto"
                initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 2.7, duration: 1.5, ease: 'easeOut' }}
                style={{
                  textShadow: '0 0 30px var(--purple-primary), 0 0 60px var(--purple-primary), 0 0 90px var(--purple-primary)',
                  zIndex: 110,
                  position: 'relative',
                  WebkitTextStroke: '3px var(--purple-primary)',
                  WebkitTextFillColor: 'rgba(167, 139, 250, 1)',
                  color: 'rgba(167, 139, 250, 1)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  unicodeBidi: 'plaintext',
                }}
              >
                <span className="block purple-glow text-[var(--purple-primary)]">
                  {profile.subtitle}
                </span>
              </motion.h2>
            )}

            {/* Status Badge - Independent Component - Clickable when live */}
            <motion.div
              ref={badgeRef}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1,
                delay: 1.2,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className="relative inline-block mt-6"
              style={{ zIndex: 110, position: 'relative' }}
              id="live-status-badge"
            >
              <motion.div
                className="absolute inset-0 bg-[var(--purple-primary)] blur-3xl opacity-50"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <motion.a
                href={profile.twitchStatus === 'live' ? 'https://www.twitch.tv/theproperhero' : undefined}
                target={profile.twitchStatus === 'live' ? '_blank' : undefined}
                rel={profile.twitchStatus === 'live' ? 'noopener noreferrer' : undefined}
                className={`relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-xl md:text-2xl font-bold ${
                  profile.twitchStatus === 'live'
                    ? 'bg-red-500/30 text-red-400 border-4 border-red-500/70 cursor-pointer hover:bg-red-500/40 transition-colors'
                    : 'bg-[var(--purple-darker)]/90 text-[var(--purple-glow)] border-4 border-[var(--purple-primary)]/70'
                } backdrop-blur-md shadow-[0_0_40px_rgba(124,58,237,0.6)]`}
                animate={{
                  boxShadow: profile.twitchStatus === 'live'
                    ? [
                        '0 0 40px rgba(239, 68, 68, 0.6)',
                        '0 0 60px rgba(239, 68, 68, 0.9)',
                      ]
                    : [
                        '0 0 40px rgba(124, 58, 237, 0.6)',
                        '0 0 60px rgba(124, 58, 237, 0.9)',
                      ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                whileHover={profile.twitchStatus === 'live' ? { scale: 1.05 } : {}}
                whileTap={profile.twitchStatus === 'live' ? { scale: 0.95 } : {}}
                style={{ pointerEvents: profile.twitchStatus === 'live' ? 'auto' : 'none' }}
              >
                <motion.span
                  className={`w-4 h-4 rounded-full ${
                    profile.twitchStatus === 'live' ? 'bg-red-500' : 'bg-[var(--purple-glow)]'
                  }`}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1],
                    boxShadow: profile.twitchStatus === 'live'
                      ? [
                          '0 0 10px rgba(239, 68, 68, 1)',
                          '0 0 30px rgba(239, 68, 68, 1)',
                        ]
                      : [
                          '0 0 10px var(--purple-glow)',
                          '0 0 30px var(--purple-glow)',
                        ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />
                <motion.span
                  animate={{
                    textShadow: [
                      '0 0 10px currentColor',
                      '0 0 20px currentColor',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {profile.twitchStatus === 'live' ? 'LIVE NOW' : 'OFFLINE'}
                </motion.span>
              </motion.a>
            </motion.div>
            
            {/* Scratched Arabic Thought Text with Arrow - Only when live - Independent elements */}
            {profile.twitchStatus === 'live' && (
              <>
                {/* Handwritten Arrow pointing from badge to note - Only show when both positions are available */}
                {badgePosition && notePosition && typeof window !== 'undefined' && (
                  <motion.svg
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ 
                      duration: 1.5, 
                      delay: 2.2,
                      ease: 'easeInOut'
                    }}
                    className="fixed top-0 left-0 pointer-events-none"
                    style={{ 
                      zIndex: 111,
                      position: 'fixed',
                      width: '100%',
                      height: '100%',
                      overflow: 'visible'
                    }}
                    viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    {(() => {
                      const startX = badgePosition.x;
                      const startY = badgePosition.y;
                      // Use actual note position from ref
                      const endX = notePosition.x;
                      const endY = notePosition.y;
                      
                      // Create wobbly, hand-drawn curve with multiple control points
                      const midX1 = startX * 0.6;
                      const midY1 = startY + 40;
                      const midX2 = startX * 0.35;
                      const midY2 = (startY + endY) / 2;
                      const midX3 = endX + 80;
                      const midY3 = endY - 30;
                      
                      return (
                        <>
                          {/* Main hand-drawn arrow path with wobbly curves - MUCH MORE VISIBLE */}
                          <path
                            d={`M ${startX} ${startY} 
                               Q ${midX1 + 5} ${midY1 - 5}, ${midX1} ${midY1}
                               Q ${midX2 + 3} ${midY2}, ${midX2 - 2} ${midY2 + 8}
                               Q ${midX3} ${midY3}, ${endX} ${endY}`}
                            stroke="#A78BFA"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            style={{
                              filter: 'drop-shadow(0 0 12px rgba(167, 139, 250, 1)) drop-shadow(0 0 24px rgba(167, 139, 250, 0.8))',
                              opacity: 0.95
                            }}
                          />
                          
                          {/* Overlapping sketch lines for hand-drawn effect - MORE VISIBLE */}
                          <path
                            d={`M ${startX + 4} ${startY + 3} 
                               Q ${midX1 + 10} ${midY1 - 2}, ${midX1 + 3} ${midY1 + 4}
                               Q ${midX2 + 8} ${midY2 + 3}, ${midX2 + 1} ${midY2 + 10}
                               Q ${midX3 - 3} ${midY3 + 5}, ${endX + 2} ${endY - 2}`}
                            stroke="#A78BFA"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            style={{ opacity: 0.7 }}
                          />
                          
                          {/* Thin sketchy lines for texture - MORE VISIBLE */}
                          <path
                            d={`M ${startX - 3} ${startY - 2} 
                               Q ${midX1 - 5} ${midY1 - 10}, ${midX1 - 3} ${midY1 - 3}`}
                            stroke="#A78BFA"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray="3,5"
                            style={{ opacity: 0.5 }}
                          />
                          
                          <path
                            d={`M ${midX2 + 12} ${midY2 - 6} 
                               Q ${midX3 + 10} ${midY3 - 4}, ${endX - 5} ${endY - 10}`}
                            stroke="#A78BFA"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray="2,4"
                            style={{ opacity: 0.45 }}
                          />
                          
                          {/* Hand-drawn arrow head - imperfect and wobbly - MORE VISIBLE - Points directly to note center */}
                          <path
                            d={`M ${endX} ${endY} 
                               L ${endX - 10} ${endY + 8} 
                               L ${endX - 5} ${endY + 10} 
                               L ${endX + 8} ${endY + 6} 
                               L ${endX + 6} ${endY + 2}
                               Z`}
                            stroke="#A78BFA"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="rgba(167, 139, 250, 0.6)"
                            style={{
                              filter: 'drop-shadow(0 0 12px rgba(167, 139, 250, 1)) drop-shadow(0 0 24px rgba(167, 139, 250, 0.8))'
                            }}
                          />
                          
                          {/* Extra arrow head outline for sketchy feel */}
                          <path
                            d={`M ${endX - 8} ${endY + 8} 
                               L ${endX + 6} ${endY + 3}`}
                            stroke="#A78BFA"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            style={{ opacity: 0.6 }}
                          />
                          
                          {/* Small starting point extension from badge - MORE VISIBLE */}
                          <circle
                            cx={startX}
                            cy={startY}
                            r="5"
                            fill="#A78BFA"
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 1)) drop-shadow(0 0 16px rgba(167, 139, 250, 0.8))',
                              opacity: 0.9
                            }}
                          />
                        </>
                      );
                    })()}
                  </motion.svg>
                )}

                {/* Arabic Note - Independent element at bottom left, bigger and closer to bottom */}
                <motion.div
                  ref={noteRef}
                  initial={{ opacity: 0, scale: 0, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: -12 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 2,
                    type: 'spring',
                    stiffness: 200 
                  }}
                  className="fixed bottom-4 left-16 md:bottom-6 md:left-24"
                  style={{ 
                    zIndex: 111,
                    position: 'fixed',
                    pointerEvents: 'auto'
                  }}
                  id="arabic-note"
                >
                  <div className="relative">
                    {/* Scratched lines overlay */}
                    <svg 
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ 
                        mixBlendMode: 'multiply',
                        opacity: 0.6 
                      }}
                    >
                      {/* Random scratched lines */}
                      <line x1="5%" y1="20%" x2="15%" y2="25%" stroke="rgba(167, 139, 250, 0.8)" strokeWidth="1.5" />
                      <line x1="20%" y1="15%" x2="30%" y2="20%" stroke="rgba(167, 139, 250, 0.8)" strokeWidth="1.2" />
                      <line x1="70%" y1="75%" x2="85%" y2="80%" stroke="rgba(167, 139, 250, 0.8)" strokeWidth="1.3" />
                      <line x1="60%" y1="70%" x2="75%" y2="75%" stroke="rgba(167, 139, 250, 0.8)" strokeWidth="1.1" />
                      <line x1="10%" y1="80%" x2="25%" y2="85%" stroke="rgba(167, 139, 250, 0.8)" strokeWidth="1.4" />
                      <line x1="80%" y1="30%" x2="95%" y2="35%" stroke="rgba(167, 139, 250, 0.8)" strokeWidth="1.2" />
                    </svg>
                    
                    {/* Arabic text - bigger and more visible */}
                    <motion.p
                      dir="rtl"
                      className="text-base md:text-lg font-bold text-[var(--purple-glow)] px-4 py-3"
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        unicodeBidi: 'bidi-override',
                        textShadow: '0 0 15px rgba(167, 139, 250, 1), 0 0 30px rgba(167, 139, 250, 0.8), 0 0 45px rgba(167, 139, 250, 0.6)',
                        transform: 'rotate(-12deg)',
                        whiteSpace: 'nowrap',
                        position: 'relative',
                        opacity: 1,
                        color: '#A78BFA',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '8px',
                        border: '2px solid rgba(167, 139, 250, 0.5)',
                      }}
                      animate={{
                        rotate: [-12, -10, -12, -14, -12],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      ترا صدق نبث !
                    </motion.p>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>

        {/* Scroll Indicator */}
        {animationPhase === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            style={{ zIndex: 110, position: 'relative' }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-[var(--purple-primary)]/50 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-[var(--purple-primary)] rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
      )}
    </section>
  );
}
