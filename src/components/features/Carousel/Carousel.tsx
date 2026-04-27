import React, { useState } from 'react';
import type { ReactNode } from 'react';
export type TCarouselProps = {
  items: ReactNode[]
  label?: string
}

export const Carousel = ({ items, label }: TCarouselProps) => {
  const [current, setCurrent] = useState(0);

  if (!items.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);

  return (
    <div className='p-carousel' aria-label={label || 'Carousel'}>
      <div className='p-carousel__track'>
        <div
          className='p-carousel__slide-list'
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {items.map((item, i) => (
            <div key={i} className='p-carousel__slide'>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className='p-carousel__controls'>
        <button
          className='p-carousel__btn p-carousel__btn--prev'
          onClick={prev}
          aria-label='Previous'
          disabled={items.length <= 1}
        >
          ‹
        </button>
        <span className='p-carousel__indicator'>
          {current + 1} / {items.length}
        </span>
        <button
          className='p-carousel__btn p-carousel__btn--next'
          onClick={next}
          aria-label='Next'
          disabled={items.length <= 1}
        >
          ›
        </button>
      </div>

      <ul className='p-carousel__dots' role='tablist'>
        {items.map((_, i) => (
          <li key={i} role='presentation'>
            <button
              className={['p-carousel__dot', i === current ? 'p-carousel__dot--active' : ''].join(' ')}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              role='tab'
              aria-selected={i === current}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
