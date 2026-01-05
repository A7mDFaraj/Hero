'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const swiperRef = useRef<SwiperType | null>(null);

  if (fanArts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--purple-glow)]/60 text-lg">No fan art to display yet.</p>
      </div>
    );
  }

  return (
    <section className="relative py-20 px-4 bg-purple-darker/30 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--purple-primary)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--purple-vibrant)]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 purple-glow text-[var(--purple-primary)]">
          Fan Art Gallery
        </h2>

        <div className="relative">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={fanArts.length > 3}
            pagination={{
              clickable: true,
              bulletClass: 'swiper-pagination-bullet-purple',
            }}
            navigation={false}
            className="!pb-12"
          >
            {fanArts.map((fanArt) => (
              <SwiperSlide key={fanArt.id}>
                <FanArtCard fanArt={fanArt} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-12 h-12 rounded-full bg-[var(--purple-darker)]/80 backdrop-blur-sm border border-[var(--purple-primary)]/50 hover:border-[var(--purple-primary)] hover:bg-[var(--purple-primary)]/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-[var(--purple-glow)] group-hover:text-[var(--purple-primary)] transition-colors" />
          </button>

          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-12 h-12 rounded-full bg-[var(--purple-darker)]/80 backdrop-blur-sm border border-[var(--purple-primary)]/50 hover:border-[var(--purple-primary)] hover:bg-[var(--purple-primary)]/20 flex items-center justify-center transition-all duration-300 hover:scale-110 group shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-[var(--purple-glow)] group-hover:text-[var(--purple-primary)] transition-colors" />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(124, 58, 237, 0.5);
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #7C3AED;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.8);
        }
      `}</style>
    </section>
  );
}
