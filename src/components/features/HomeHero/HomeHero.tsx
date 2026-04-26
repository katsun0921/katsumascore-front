'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import { gsap } from 'gsap';
import 'swiper/swiper.css';
import 'swiper/css/effect-cards';
export type HomeHeroSlide = {
  title: string;
  copy: string;
  score: number;
  rank: 'SS' | 'S' | 'A' | 'B' | 'C';
  href: string;
  image: string;
};

export type HomeHeroProps = {
  slides: HomeHeroSlide[];
};

const SWIPER_MODULES = [EffectCards, Autoplay];

const RANK_COLORS: Record<string, string> = {
  SS: 'var(--color-score-accent)',
  S:  'var(--color-score-rank-high)',
  A:  'var(--color-score-rank-mid)',
  B:  'var(--color-score-rank-low)',
  C:  'var(--color-score-rank-low)',
};

export const HomeHero = ({ slides }: HomeHeroProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const scoreBlockRef    = useRef<HTMLDivElement>(null);
  const textBlockRef     = useRef<HTMLDivElement>(null);
  const hexPathRef       = useRef<SVGPathElement>(null);
  const scoreNumRef      = useRef<HTMLDivElement>(null);
  const swiperRef        = useRef<SwiperInstance | null>(null);
  const tlRef            = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingRef   = useRef(false);
  const hasInitializedRef = useRef(false);
  const prefixClassName = 'homeHero';

  const current = slides[activeIndex] ?? slides[0];

  const animateOut = (onComplete: () => void) => {
    if (tlRef.current) tlRef.current.kill();
    gsap.to([scoreBlockRef.current, textBlockRef.current], {
      opacity: 0, y: 12, duration: 0.25,
      onComplete,
    });
    gsap.set(hexPathRef.current, { strokeDashoffset: 400 });
  };

  const animateIn = (score: number) => {
    if (scoreNumRef.current) scoreNumRef.current.textContent = '0.0';

    const counter = { val: 0 };
    const tl = gsap.timeline();
    tlRef.current = tl;
    tl.to(hexPathRef.current, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' })
      .to(scoreBlockRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.4')
      .to(counter, {
        val: score,
        duration: 1.0,
        ease: 'power3.out',
        onUpdate: () => {
          if (scoreNumRef.current) scoreNumRef.current.textContent = counter.val.toFixed(1);
        },
      }, '-=0.5')
      .to(textBlockRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.7');
  };

  // 初回登場
  useEffect(() => {
    gsap.set([scoreBlockRef.current, textBlockRef.current], { opacity: 0, y: 0 });
    gsap.set(hexPathRef.current, { strokeDashoffset: 400 });
    const initTl = gsap.timeline({ delay: 0.3 });
    initTl.call(() => {
      hasInitializedRef.current = true;
      animateIn(slides[0].score);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSlideChange = (realIndex: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    animateOut(() => {
      setActiveIndex(realIndex);
      isAnimatingRef.current = false;
    });
  };

  // activeIndex が変わったらアニメーションIn
  useEffect(() => {
    if (!hasInitializedRef.current) return; // 初回はuseEffect[0]が担う
    animateIn(slides[activeIndex].score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <section className={prefixClassName} aria-label='ホームヒーローセクション'>
      {/* 背景レイヤー */}
      <div className={`${prefixClassName}__bg`} aria-hidden='true'>
        {slides.map((slide, i) => (
          <div key={slide.image} className={`${prefixClassName}__bgOverlay`}>
            <Image
              key={slide.image}
              src={slide.image}
              alt=''
              className={`${prefixClassName}__bgImg${i === activeIndex ? ' is-active' : ''}`}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* コンテンツ */}
      <div className={`${prefixClassName}__inner`}>

        {/* Left: テキスト */}
        <div className={`${prefixClassName}__left`}>
          {/* スコア */}
          <div className={`${prefixClassName}__scoreBlock`} ref={scoreBlockRef}>
            <div className={`${prefixClassName}__hexWrap`}>
              <svg viewBox='0 0 100 100' aria-label={`スコア ${current.score} ランク ${current.rank}`}>
                <path
                  ref={hexPathRef}
                  className={`${prefixClassName}__hexPath`}
                  d='M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z'
                />
              </svg>
              <div
                ref={scoreNumRef}
                className={`${prefixClassName}__scoreVal`}
                style={{ color: RANK_COLORS[current.rank] }}
              >
                {current.score.toFixed(1)}
              </div>
            </div>
            <div className={`${prefixClassName}__scoreMeta`}>
              <span className={`${prefixClassName}__scoreRank`} style={{ color: RANK_COLORS[current.rank] }}>
                {current.rank} RANK
              </span>
            </div>
          </div>

          {/* テキスト */}
          <div className={`${prefixClassName}__textBlock`} ref={textBlockRef}>
            <p className={`${prefixClassName}__copy`}>{current.copy}</p>
            <h2 className={`${prefixClassName}__title`}>{current.title}</h2>
            <Link href={current.href} className={`${prefixClassName}__readReview`}>
              レビューを読む
              <span className={`${prefixClassName}__readReviewArrow`} aria-hidden='true'>
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Right: Swiper Cards */}
        <div className={`${prefixClassName}__right`}>
          <Swiper
            modules={SWIPER_MODULES}
            effect='cards'
            grabCursor
            loop={false}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false
            }}
            className={`${prefixClassName}__swiper`}
            onSwiper={(swiper) => { swiperRef.current = swiper; swiper.autoplay.start(); }}
            onRealIndexChange={(swiper) => handleSlideChange(swiper.realIndex)}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.image} className={`${prefixClassName}__swiperSlide`}>
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes='(max-width: 767px) 220px, 260px'
                  style={{ objectFit: 'cover' }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </section>
  );
};
