import type { PostCardData } from './PostCard.types';

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
