export type ReleaseHighlightItem = {
  title: string;
  publishedAt: string;
  href: string;
};

export type HomeReleaseHighlightProps = {
  theaterTitle: string;
  vodTitle: string;
  theaterItem?: ReleaseHighlightItem;
  vodItem?: ReleaseHighlightItem;
};
