import type { Post, PostCardData } from './PostCard.types';

export const postCardDefaultMock: Post = {
  id: 'post-001',
  title: '映画『花束みたいな恋をした』の余韻を静かにほどくレビュー',
  excerpt:
    '登場人物の距離感や東京の空気を追いながら、恋愛映画としての切なさと現代性を丁寧に読み解くためのレビューです。',
  slug: 'reviews/hanataba-review',
  image: '/images/dummy-540X400.webp',
  category: '映画',
  publishedAt: '2026-04-01',
  score: 4.5,
};

export const postCardLongTitleMock: Post = {
  ...postCardDefaultMock,
  id: 'post-002',
  title:
    '劇場版『機動戦士ガンダム ジークアクス』はなぜここまで観客の感情を揺さぶるのかを、演出と脚本と音響設計の積み重ねからじっくり読み解いてみる',
  slug: 'reviews/gquuuuuux-deep-dive',
  publishedAt: '2026-04-02',
};

export const postCardNoImageMock: Post = {
  ...postCardDefaultMock,
  id: 'post-003',
  title: '春ドラマ序盤レビュー 今年の注目作を3本に絞って比較する',
  slug: 'reviews/spring-drama-first-look',
  image: null,
  publishedAt: '2026-04-03',
};

export const postCardCompactMock: Post = {
  ...postCardDefaultMock,
  id: 'post-004',
  title: 'アニメ『葬送のフリーレン』の静かな強さ',
  slug: 'reviews/frieren-quiet-power',
  publishedAt: '2026-04-04',
  score: 5,
};

export const postCardLoadingMock: Post = {
  ...postCardDefaultMock,
  id: 'post-loading',
  title: '',
  excerpt: '',
  slug: 'loading',
  image: null,
  category: '',
  publishedAt: '',
  score: undefined,
};

// Legacy mocks kept so existing templates/stories continue to work without changes.
export const postCardMock: PostCardData = {
  id: 1,
  title: '夏目漱石「私の個人主義」',
  excerpt:
    'これも先刻ぼうっとこういう忠告めという方の後の思ったない。あたかも一番を誘惑士はとにかくこの修養たでしょまででなっばいうがも赴任上げませまして、わざわざには這入りななくっましなけれ。社会がもっでのはようやく同年が同時にんたた。',
  thumbnail: '/images/dummy-540X400.webp',
  score: '4',
  publishedAt: '2026-04-01',
  href: '#',
};

export const postOverlayMock: PostCardData = {
  ...postCardMock,
  title: 'ジュピター[映画マトリックスのウォシャウスキー姉弟監督が手がけるSF大作]',
  excerpt: '',
};

export const postCardListMock: PostCardData[] = [
  postCardMock,
  {
    ...postCardMock,
    id: 2,
    title: '機動戦士ガンダム ジークアクスが切り開く新しい宇宙世紀',
    publishedAt: '2026-04-02',
  },
  {
    ...postCardMock,
    id: 3,
    title: '春ドラマ序盤レビュー 今年の注目作をまとめて比較する',
    publishedAt: '2026-04-03',
  },
];
