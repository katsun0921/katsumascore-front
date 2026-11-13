/**
 * サヨ（AI映画店主）UIの型。docs/develop/sayo_chat_spec.md
 * ai-chat・WordPress の応答は libs 側で zod 検証してからこの形にする。
 */

/** 立ち絵の表情。API は返さないためフロントで決める */
export type SayoExpression = 'default' | 'thinking' | 'recommend' | 'sorry' | 'secret';

/** WordPress /v1/sayo-chat-status（Next の /api/sayo-chat-status 経由） */
export type SayoStatus = {
  visible: boolean;
  paused: boolean;
  message: string | null;
  resumeAt: string | null;
};

/** サヨが示す記事（ai-chat の ArticleCard を正規化したもの） */
export type SayoArticle = {
  id: number;
  title: string;
  href: string;
  category: string;
  score?: number;
  image: string | null;
  vodLabel?: string;
  vodCheckedAt?: string;
  moodTags: string[];
};

/** 承認済み要約（GET /api/chat/articles/{id}/summary） */
export type SayoSummary = {
  articleId: number;
  lead: string;
  summary: string;
  recommendFor: string;
  moodTags: string[];
  article: SayoArticle;
};

/** 入口の候補ボタン（気分タグで探す。LLMなし） */
export type SayoMoodChip = {
  label: string;
};

/** 探した結果。source: 'tags'＝候補ボタン（回数を減らさない）／'llm'＝自由入力 */
export type SayoSearchResult = {
  source: 'tags' | 'llm';
  reply: string;
  articles: SayoArticle[];
  remaining?: number;
};

/** ai-chat /message の status（schema/message の列挙に合わせる） */
export type SayoMessageStatus =
  | 'ok'
  | 'no_match'
  | 'too_long'
  | 'limit_user'
  | 'limit_global'
  | 'session_expired'
  | 'disabled'
  | 'error';

/** 会話の返事（POST /api/chat/message） */
export type SayoMessageResult = {
  status: SayoMessageStatus;
  reply: string;
  articles: SayoArticle[];
  spoiler: boolean;
  remaining: number;
};

/**
 * サヨの取得関数のまとめ。本番は libs/api の実装、Storybook は features/sayo/mocks の架空実装を渡す。
 * components から直接 fetch しないための境界。
 */
export type SayoClient = {
  getStatus: (lang: 'ja' | 'en') => Promise<SayoStatus>;
  getHealth: () => Promise<{ enabled: boolean }>;
  getSummary: (articleId: number) => Promise<SayoSummary>;
  searchByMood: (chip: SayoMoodChip, category?: string) => Promise<SayoSearchResult>;
  searchFree: (query: string, category?: string) => Promise<SayoSearchResult>;
  sendMessage: (req: { message: string; articleId?: number }) => Promise<SayoMessageResult>;
};
