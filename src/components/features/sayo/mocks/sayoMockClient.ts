/**
 * Storybook 用の架空 SayoClient。通信せず、src/mocks/sayo.ts の架空データで応答する。
 * 本番の実装は src/libs/api/sayoChat.ts（未実装）。
 */
import type { SayoClient, SayoMessageResult, SayoMessageStatus, SayoStatus } from '@/types/sayo';
import { sayoMockArticles, sayoMockChips, sayoMockEntries, sayoMockSummary } from '@/mocks/sayo';

export type SayoMockOptions = {
  status?: Partial<SayoStatus>;
  /** true で WP フラグの取得に失敗する */
  statusFails?: boolean;
  /** false で ai-chat の health が受付終了を返す */
  healthEnabled?: boolean;
  /** 最初の残り回数 */
  remaining?: number;
  /** 会話の返事を強制する（limit_user・error など） */
  forceMessageStatus?: SayoMessageStatus;
  /** 応答の遅さ（ミリ秒）。Storybook のテストでは 0 にする */
  delayMs?: number;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const NO_MATCH = 'ごめんなさい、今ある記事からは、ぴったりの作品が見つかりませんでした。気分やジャンルを、別の言い方で教えていただけますか？';

/** 自由入力の架空の検索語（本番はLLM＋ベクトル検索） */
const FREE_WORDS: { re: RegExp; ids: number[] }[] = [
  { re: /ホラー|怖/, ids: [1201, 1203] },
  { re: /泣|恋愛|手紙|切な/, ids: [1204] },
  { re: /アニメ/, ids: [1203] },
  { re: /ドラマ|短い|会話/, ids: [1206] },
  { re: /ロボ|特撮|メカ/, ids: [1205] },
  { re: /映画館|名画座|撮影/, ids: [1202] },
];

/**
 * 記事の話への架空の返事
 * @param id 記事ID
 * @param q 質問
 */
const replyAbout = (id: number | undefined, q: string): Pick<SayoMessageResult, 'reply' | 'articles' | 'spoiler'> => {
  const e = sayoMockEntries.find((x) => x.id === id) ?? sayoMockEntries[0];
  const i = sayoMockEntries.indexOf(e);
  const similar = sayoMockArticles[(i + 4) % sayoMockArticles.length];
  const rules: { test: (s: string) => boolean; make: () => Pick<SayoMessageResult, 'reply' | 'articles' | 'spoiler'> }[] = [
    { test: (s) => s.includes('似た'), make: () => ({ reply: `似た空気の作品でしたら、記事のある中では『${similar.title}』が近いと思います。どちらも、音の使い方で気持ちを運ぶタイプの作品なんです。`, articles: [similar], spoiler: false }) },
    { test: (s) => /結末|ネタバレ/.test(s), make: () => ({ reply: '……では、結末に触れますね。記事では、最後の場面で主人公が選んだ道を「静かな決着」と評しています。最初の場面とつながる終わり方なので、もう一度観返したくなるはずです。', articles: [], spoiler: true }) },
    { test: (s) => s.includes('惜しい'), make: () => ({ reply: '記事では、テンポがゆっくりな分、合わない人には中盤が長く感じられるかもしれない、と書かれています。私は、その「間」こそがこの作品らしさだとも思うのですが……好みが分かれるところですね。', articles: [], spoiler: false }) },
  ];
  const hit = rules.find((r) => r.test(q));
  if (hit) return hit.make();
  return { reply: `あっ、それなら……記事でいちばん熱を込めて書かれているのは、${e.moodTags[0] ?? ''}空気を作る演出の部分です。${e.recommendFor.replace(/に$/, '')}には、きっと刺さると思います。`, articles: [], spoiler: false };
};

/** 架空の SayoClient を作る */
export const createSayoMockClient = (opts: SayoMockOptions = {}): SayoClient => {
  const delay = opts.delayMs ?? 400;
  let remaining = opts.remaining ?? 30;
  return {
    getStatus: async () => {
      await wait(delay / 2);
      if (opts.statusFails) throw new Error('status fetch failed');
      return { visible: true, paused: false, message: null, resumeAt: null, ...opts.status };
    },
    getHealth: async () => {
      await wait(delay / 4);
      return { enabled: opts.healthEnabled ?? true };
    },
    getSummary: async (id) => {
      await wait(delay);
      return sayoMockSummary(id);
    },
    searchByMood: async (chip, category) => {
      await wait(delay);
      const def = sayoMockChips.find((c) => c.label === chip.label);
      const pool = category ? sayoMockArticles.filter((a) => a.category === category) : sayoMockArticles;
      const articles = def ? pool.filter((a) => a.moodTags.some((tag) => def.tags.includes(tag))).slice(0, 3) : [];
      return { source: 'tags', reply: articles.length && def ? def.reply : NO_MATCH, articles };
    },
    searchFree: async (query, category) => {
      await wait(delay * 3);
      remaining = Math.max(0, remaining - 1);
      const ids = FREE_WORDS.filter((w) => w.re.test(query)).flatMap((w) => w.ids);
      const pool = category ? sayoMockArticles.filter((a) => a.category === category) : sayoMockArticles;
      const articles = pool.filter((a) => ids.includes(a.id)).slice(0, 3);
      const reply = articles.length ? `「${query}」でしたら、記事の中からこちらを選びました。気になる作品があれば、要約もお話しできますよ。` : NO_MATCH;
      return { source: 'llm', reply, articles, remaining };
    },
    sendMessage: async ({ message, articleId }) => {
      await wait(delay * 3);
      if (opts.forceMessageStatus && opts.forceMessageStatus !== 'ok') {
        return { status: opts.forceMessageStatus, reply: '', articles: [], spoiler: false, remaining: opts.forceMessageStatus.startsWith('limit') ? 0 : remaining };
      }
      if (remaining <= 0) return { status: 'limit_user', reply: '', articles: [], spoiler: false, remaining: 0 };
      remaining -= 1;
      return { status: 'ok', ...replyAbout(articleId, message), remaining };
    },
  };
};
