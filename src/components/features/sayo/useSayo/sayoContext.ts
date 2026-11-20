import { createContext, useContext } from 'react';
import type { SayoClient, SayoSearchResult, SayoStatus } from '@/types/sayo';

/** 探した結果の状態（モーダル・ノベル画面で共有） */
export type SayoSearchState = {
  query: string;
  /** chip＝候補ボタン（気分タグ・LLMなし）／free＝自由入力（LLM） */
  kind: 'chip' | 'free';
  category?: string;
  result: SayoSearchResult | null;
  /** closed＝ai-chat が受付終了／error＝取得に失敗 */
  failure?: 'closed' | 'error';
};

/** モーダルの状態：作品の要約か、探した結果か */
export type SayoModalState =
  | { kind: 'summary'; ids: number[]; index: number; search: SayoSearchState | null }
  | { kind: 'search'; search: SayoSearchState };

/** ノベル画面の状態：作品の話か、探した結果の話か */
export type SayoNovelState =
  | { kind: 'post'; id: number; search: SayoSearchState | null }
  | { kind: 'search'; search: SayoSearchState };

/** LLMを使う操作を止めている理由。null なら送ってよい */
export type SayoBlockReason = 'paused' | 'limit' | 'closed' | null;

export type SayoContextValue = {
  client: SayoClient;
  /** フラグ（取得前・失敗は null） */
  status: SayoStatus | null;
  /** サヨのUIを出してよいか（ja・取得済み・visible） */
  visible: boolean;
  /** 候補ボタンの文言 */
  chips: string[];
  /** リストページのカテゴリ（TOPは未指定） */
  category?: string;
  remaining: number;
  setRemaining: (n: number) => void;
  block: SayoBlockReason;
  /** ai-chat の受付状況を確かめる（LLMを使う直前に呼ぶ）。受付中なら true */
  ensureHealth: () => Promise<boolean>;
  modal: SayoModalState | null;
  novel: SayoNovelState | null;
  openSummary: (id: number, ids: number[], trigger?: HTMLElement | null) => void;
  openSearch: (query: string, kind: 'chip' | 'free', trigger?: HTMLElement | null) => void;
  showSummaryInSearch: (id: number) => void;
  backToSearch: () => void;
  step: (delta: number) => void;
  openNovel: () => void;
  /** ノベル画面で話す作品を変える */
  talkAbout: (id: number) => void;
  backFromNovel: () => void;
  closeAll: () => void;
};

export const SayoContext = createContext<SayoContextValue | null>(null);

/** SayoProvider の中で使う。外で呼ぶと例外 */
export const useSayo = (): SayoContextValue => {
  const v = useContext(SayoContext);
  if (!v) throw new Error('useSayo must be used inside SayoProvider');
  return v;
};

/** SayoProvider の外でも呼べる版（外なら null）。カードのボタンなど、置く場所を選ばない部品で使う */
export const useSayoOptional = (): SayoContextValue | null => useContext(SayoContext);
