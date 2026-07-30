'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { getRankingIcon } from './getRankingIcon';
import type { RankLabel } from './getRankingIcon';

/** value/max 表記用: 整数部（大）と小数＋/max（小）に分割 */
const formatScoreStr = (value: number): string =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const getRankModifier = (rank: RankLabel | null): string =>
  rank ? `rank-${rank.toLowerCase()}` : 'rank-none';

export type ScoreWithRankProps = {
  value: number
  max: number
  imageOnly?: boolean
}
const prefixClassName = 'score-with-rank';

const ScoreWithRankInner = ({ value, max, imageOnly = false }: ScoreWithRankProps) => {
  const rank = getRankingIcon(value);
  const modifier = getRankModifier(rank?.label ?? null);

  const rootRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const slashRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const decimalRef = useRef<HTMLSpanElement>(null);

  const targetStr = formatScoreStr(value);
  const dotIdx = targetStr.indexOf('.');
  const targetInt = dotIdx === -1 ? targetStr : targetStr.slice(0, dotIdx);
  const targetDecimal = dotIdx === -1 ? '' : targetStr.slice(dotIdx);
  const sub = `/${max}`;

  const [displayInt, setDisplayInt] = useState('0');
  const [displayDecimal, setDisplayDecimal] = useState(targetDecimal);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(root);

        void import('gsap').then(({ gsap }) => {
          if (cancelled) return;

          const tl = gsap.timeline();

          gsap.set(textRef.current, { opacity: 0, scale: 0.9, filter: 'blur(4px)' });

          if (badgeRef.current) {
            gsap.set(badgeRef.current, { y: '-120%', opacity: 0, scale: 0.8 });
            tl.to(badgeRef.current, {
              y: '-10%',
              opacity: 1,
              scale: 1,
              duration: 0.6,
              ease: 'power3.out',
            });
            tl.to(badgeRef.current, { scale: 1.05, duration: 0.1, ease: 'power1.in' }, '-=0.1');
            tl.to(badgeRef.current, { scale: 1, duration: 0.15, ease: 'power2.out' });
          }

          tl.to(
            textRef.current,
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' },
            badgeRef.current ? '-=0.3' : '0',
          );

          if (slashRef.current) {
            gsap.set(slashRef.current, { scaleX: 0, opacity: 0, transformOrigin: 'left center' });
            tl.to(
              slashRef.current,
              { scaleX: 1, opacity: 1, duration: 0.5, ease: 'power2.out' },
              '-=0.3',
            );
          }

          const counter = { val: 0 };
          gsap.to(counter, {
            val: value,
            duration: 1.2,
            ease: 'expo.out',
            onUpdate() {
              const cur = counter.val;
              const str = Number.isInteger(value) ? String(Math.round(cur)) : cur.toFixed(1);
              const dot = str.indexOf('.');
              setDisplayInt(dot === -1 ? str : str.slice(0, dot));
              setDisplayDecimal(dot === -1 ? '' : str.slice(dot));
            },
            onComplete() {
              setDisplayInt(targetInt);
              setDisplayDecimal(targetDecimal);
            },
          });

          tl.to(textRef.current, { scale: 1.02, duration: 0.1, ease: 'power1.in' }, '+=1.1');
          tl.to(textRef.current, { scale: 1, duration: 0.1, ease: 'power2.out' });
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(root);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [value, targetInt, targetDecimal]);

  if (imageOnly) {
    return rank ? (
      <Image
        data-component='ScoreWithRankInner'
        src={rank.src}
        alt={`rank ${rank.label}`}
        width={96}
        height={96}
        className='score-with-rank__badge-img--standalone'
      />
    ) : null;
  }

  return (
    <div data-component='ScoreWithRankInner' ref={rootRef} className={`${prefixClassName}__inner`}>
      {rank ? (
        <div ref={badgeRef} className={`${prefixClassName}__badge`}>
          <Image
            src={rank.src}
            alt={`rank ${rank.label}`}
            width={96}
            height={96}
            className={`${prefixClassName}__badge-img`}
          />
        </div>
      ) : null}
      <div ref={textRef} className={`${prefixClassName}__text ${prefixClassName}__text--${modifier}`}>
        <span className={`${prefixClassName}__value-wrap`}>
          <span
            ref={slashRef}
            className={`${prefixClassName}__slash ${prefixClassName}__slash--${modifier}`}
          ></span>
          <span className={`${prefixClassName}__value-inner`}>
            <span ref={countRef}>{displayInt}</span>
            <span ref={decimalRef} className={`${prefixClassName}__decimal`}>
              {displayDecimal}{sub}
            </span>
          </span>
        </span>
      </div>
    </div>
  );
};

export const ScoreWithRank = (props: ScoreWithRankProps) => {
  return (
    <div
      data-component='ScoreWithRank'
      className={`${prefixClassName} notranslate`}
      data-score-with-rank-root
    >
      <ScoreWithRankInner {...props} />
    </div>
  );
};
