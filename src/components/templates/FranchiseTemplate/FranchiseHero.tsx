import Image from 'next/image';
import type { FranchiseHeroImage } from '@/types/franchise';
import styles from './FranchiseHero.module.scss';

type FranchiseHeroProps = {
  title: string;
  catchCopy: string;
  heroImage: FranchiseHeroImage | null;
};

export const FranchiseHero = ({ title, catchCopy, heroImage }: FranchiseHeroProps) => (
  <div className={styles.franchiseHero}>
    {heroImage && (
      <div className={styles.franchiseHero__image}>
        <Image
          src={heroImage.url}
          alt={heroImage.alt}
          fill
          className={styles.franchiseHero__img}
          priority
        />
        <div className={styles.franchiseHero__overlay} />
      </div>
    )}
    <div className={styles.franchiseHero__content}>
      <h1 className={styles.franchiseHero__title}>{title}</h1>
      {catchCopy && <p className={styles.franchiseHero__catchCopy}>{catchCopy}</p>}
    </div>
  </div>
);
