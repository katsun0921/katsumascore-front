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

const RANK_CLASS_MAP: Record<HomeHeroSlide['rank'], string> = {
  SS: 'homeHero__rank--ss',
  S: 'homeHero__rank--s',
  A: 'homeHero__rank--a',
  B: 'homeHero__rank--b',
  C: 'homeHero__rank--c',
};

export const HomeHero = ({ slides }: HomeHeroProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const scoreBlockRef    = useRef<HTMLDivElement>(null);
  const textBlockRef     = useRef<HTMLDivElement>(null);
  const scoreNumRef      = useRef<HTMLDivElement>(null);
  const swiperRef        = useRef<SwiperInstance | null>(null);
  const tlRef            = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingRef   = useRef(false);
  const hasInitializedRef = useRef(false);
  const prefixClassName = 'homeHero';

  const current = slides[activeIndex] ?? slides[0];
  const rankClassName = RANK_CLASS_MAP[current.rank] ?? RANK_CLASS_MAP.A;
  const shortCopy = current.copy.length > 22 ? `${current.copy.slice(0, 22)}...` : current.copy;

  const animateOut = (onComplete: () => void) => {
    if (tlRef.current) tlRef.current.kill();
    gsap.to([scoreBlockRef.current, textBlockRef.current], {
      opacity: 0, y: 12, duration: 0.25,
      onComplete,
    });
  };

  const animateIn = (score: number) => {
    if (scoreNumRef.current) scoreNumRef.current.textContent = '0.0';

    const counter = { val: 0 };
    const tl = gsap.timeline();
    tlRef.current = tl;
    tl.to(scoreBlockRef.current, { opacity: 1, y: 0, duration: 0.4 }, '+=0.05')
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
              fill
              sizes='100vw'
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
          <div className={`${prefixClassName}__scoreBlock ${rankClassName}`} ref={scoreBlockRef}>
            <div className={`${prefixClassName}__scoreCard`}>
              <span className={`${prefixClassName}__scoreLabel`}>KATSUMASCORE</span>
              <div ref={scoreNumRef} className={`${prefixClassName}__scoreVal`}>
                {current.score.toFixed(1)}
              </div>
              <span className={`${prefixClassName}__scoreRank`}>
                {current.rank} RANK
              </span>
            </div>            
          </div>

          {/* テキスト */}
          <div className={`${prefixClassName}__textBlock`} ref={textBlockRef}>
            <p className={`${prefixClassName}__copy`}>{shortCopy}</p>
            <p className={`${prefixClassName}__copySub`}>詳細レビューは下部へ</p>
            <h2 className={`${prefixClassName}__title`}>{current.title}</h2>
            <Link href={current.href} className={`${prefixClassName}__readReview`}>
              レビューを読む →
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
            {slides.map((slide, i) => (
              <SwiperSlide key={slide.image} className={`${prefixClassName}__swiperSlide`}>
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes='(max-width: 767px) 220px, 260px'
                  className={`${prefixClassName}__swiperImage`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </section>
  );
};
