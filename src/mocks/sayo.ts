/**
 * サヨUIの Storybook 用の架空データ（作品・要約・スコアはすべて架空）。
 * ui-proposals/sayo-chat/card-mock.js と同じ6作品。
 */
import type { SayoArticle, SayoMoodChip, SayoSummary } from '@/types/sayo';

type MockEntry = SayoArticle & { summary: string; recommendFor: string };

const IMG = '/images/mock-image.webp';

export const sayoMockEntries: MockEntry[] = [
  {
    id: 1201, href: '/posts/kiri-no-todaimori', title: '霧の灯台守', category: '映画', score: 4.2, image: IMG,
    vodLabel: 'U-NEXT / Netflix', vodCheckedAt: '2026/10/22', moodTags: ['じわじわ怖い', '静か', '雰囲気重視'],
    summary: '孤島の灯台を一人で守る男が、毎晩少しずつ濃くなる霧と、霧の向こうから届く信号に悩まされる物語です。記事では、波の音が途切れる瞬間の「無音」の使い方を高く評価していて、驚かせる場面はほとんどないのに、画面の暗がりを自分から探してしまう怖さがあると書かれています。',
    recommendFor: '大きな音で驚かされるのは苦手だけど、ホラーの空気は味わいたい人に',
  },
  {
    id: 1202, href: '/posts/mayonaka-no-eishashitsu', title: '真夜中の映写室', category: '映画', score: 3.8, image: IMG,
    vodLabel: 'Prime Video', vodCheckedAt: '2026/10/18', moodTags: ['しみじみ', '映画好き向け'],
    summary: '閉館が決まった名画座の最後の一夜を、映写技師・常連客・アルバイトの三人の視点で描く群像劇です。記事では、実際に動く古い映写機を修理して撮影に使ったことに触れ、フィルムの回る音が登場人物の気持ちの揺れと重なる演出を見どころに挙げています。一方で、中盤の回想がやや長いという指摘もあります。',
    recommendFor: '映画館という場所そのものが好きな人、撮影の工夫に目が行く人に',
  },
  {
    id: 1203, href: '/posts/chochinzaka-kaidancho', title: '提灯坂の怪談帖', category: 'アニメ', score: 4.5, image: IMG,
    vodLabel: 'dアニメストア / U-NEXT', vodCheckedAt: '2026/10/20', moodTags: ['ちょっと怖い', '切ない', '一話完結'],
    summary: '坂の途中にある古本屋に、毎回いわくつきの本が持ち込まれる一話完結の怪談アニメです。記事では、背景美術の提灯の明かりが話ごとに色を変え、その回の怖さの種類を先に知らせている工夫を紹介しています。怖さは控えめで、後味が切ない回が多いとまとめられています。',
    recommendFor: '寝る前に一話ずつ、少しだけ怖い話を観たい人に',
  },
  {
    id: 1204, href: '/posts/sayonara-no-ondo', title: 'さよならの温度', category: '映画', score: 4.6, image: IMG,
    vodLabel: 'Netflix', vodCheckedAt: '2026/10/21', moodTags: ['泣ける', '静か', '大人向け'],
    summary: '一度しか会ったことのない二人が、手紙だけで十年をつないでいく恋愛映画です。記事では、手紙の文字をそのまま画面に映す演出によって、声に出されない気持ちが観客にだけ届く構成を評価しています。派手な事件は起きませんが、季節の移り変わりと筆跡の変化で時間の重みを感じさせる作品だと書かれています。',
    recommendFor: 'ゆっくり進む物語で、余韻に浸りたい人に',
  },
  {
    id: 1205, href: '/posts/kotetsu-no-parade', title: '鋼鉄のパレード', category: '映画', score: 3.4, image: IMG,
    vodLabel: 'Disney+ / Prime Video', vodCheckedAt: '2026/10/01', moodTags: ['ワクワク', '家族向け'],
    summary: '年に一度、巨大ロボットが街を練り歩く祭りの前夜、動かなくなった一体を直そうとする整備士たちの奮闘を描きます。記事では、模型と実物大の造形を組み合わせたロボットの質感を高く評価する一方、人物の掘り下げが浅く、終盤が駆け足になっている点を惜しいとしています。',
    recommendFor: 'メカの造形や特撮の手触りを楽しみたい人に',
  },
  {
    id: 1206, href: '/posts/hoshikuzu-laundry', title: '星屑ランドリー', category: 'ドラマ', score: 4.0, image: IMG,
    vodLabel: 'Hulu', vodCheckedAt: '2026/09/30', moodTags: ['ほっこり', '会話劇'],
    summary: '深夜営業のコインランドリーを舞台に、洗濯が終わるまでの40分だけ言葉を交わす人々を描く連続ドラマです。記事では、各話がほぼ実時間で進む構成と、乾燥機の回る音を会話の間として使う演出を見どころに挙げています。後半の数話は登場人物がつながっていき、全体で一つの物語になると書かれています。',
    recommendFor: '短い時間で少しずつ観られる、会話の面白い作品を探している人に',
  },
];

/** 記事データだけ（SayoArticle） */
export const sayoMockArticles: SayoArticle[] = sayoMockEntries.map(({ summary: _s, recommendFor: _r, ...a }) => a);

/**
 * 架空の承認済み要約を返す
 * @param id 記事ID
 */
export const sayoMockSummary = (id: number): SayoSummary => {
  const e = sayoMockEntries.find((x) => x.id === id) ?? sayoMockEntries[0];
  const { summary, recommendFor, ...article } = e;
  return { articleId: e.id, lead: `『${e.title}』は、こんな作品です。`, summary, recommendFor, moodTags: e.moodTags, article };
};

/** 候補ボタン（気分タグで探す）と、探すタグの対応 */
export const sayoMockChips: (SayoMoodChip & { tags: string[]; reply: string })[] = [
  { label: '怖すぎないホラー', tags: ['じわじわ怖い', 'ちょっと怖い'], reply: '怖すぎないホラーでしたら、こちらはいかがでしょう。大きな音で驚かせるより、空気でじわじわ来るタイプです。' },
  { label: '泣ける作品', tags: ['泣ける', '切ない'], reply: '泣ける作品なら、こちらを。どれも観たあとに余韻が長く残るタイプです。' },
  { label: '少しずつ観たい', tags: ['一話完結', '会話劇'], reply: '短い時間で区切って観られる作品を選びました。寝る前の一話にも向いています。' },
  { label: 'ワクワクしたい', tags: ['ワクワク', '家族向け'], reply: 'ワクワクしたい日には、こちらはいかがでしょう。' },
];

/** 異常系：とても長い作品名・画像なし・タグなし */
export const sayoMockChaosArticle: SayoArticle = {
  id: 1299, href: '/posts/chaos', title: '劇場版 機動戦士ガンダム ジークアクス 〜はじまりの地球と、終わらない夏の記憶〜 特別編集版', category: 'アニメ',
  image: null, moodTags: [],
};

/** 異常系：多数（Dense 10+ / Extreme 20+ 用） */
export const sayoMockManyArticles = (n: number): SayoArticle[] =>
  Array.from({ length: n }, (_, i) => ({ ...sayoMockArticles[i % sayoMockArticles.length], id: 2000 + i, title: `${sayoMockArticles[i % sayoMockArticles.length].title}（${i + 1}）` }));
