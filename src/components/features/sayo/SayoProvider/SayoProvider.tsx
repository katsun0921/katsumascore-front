import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocale } from '@/i18n/provider';
import { SayoContext } from '@/components/features/sayo/useSayo';
import type { SayoBlockReason, SayoContextValue, SayoSummaryCache, SayoModalState, SayoNovelState, SayoSearchState } from '@/components/features/sayo/useSayo';
import { SayoSummaryModal } from '@/components/features/sayo/SayoSummaryModal';
import { SayoNovelStage } from '@/components/features/sayo/SayoNovelStage';
import { SayoConsentModal } from '@/components/features/sayo/SayoConsentModal';
import { useSayoConsent } from '@/components/features/sayo/useSayoConsent';
import type { SayoClient, SayoStatus, SayoSummary } from '@/types/sayo';

/** Storybook・確認用：最初から開いておく状態 */
export type SayoInitialState = {
  summaryId?: number;
  ids?: number[];
  /** summaryId の要約からノベル画面を開く */
  novel?: boolean;
  /** 候補ボタンを押した状態で開く */
  searchChip?: string;
};

export type SayoProviderProps = {
  /** 取得関数のまとめ。本番は libs/api の実装、Storybook は架空実装 */
  client: SayoClient;
  /** 候補ボタンの文言（気分タグで探す） */
  chips: string[];
  /** リストページのカテゴリ（例：映画）。TOPは未指定 */
  category?: string;
  /** 残り回数の初期値（/session の remaining） */
  initialRemaining?: number;
  initial?: SayoInitialState;
  children: ReactNode;
};

/**
 * サヨのUI全体の状態を持つ。フラグを読み、モーダルとノベル画面を描く。
 * はじめて使う人（利用規約に未同意）には、要約・探す操作の前に同意画面を出し、同意してから続ける。
 * docs/develop/sayo_chat_spec.md §4・§7
 */
export const SayoProvider = ({ client, chips, category, initialRemaining = 30, initial, children }: SayoProviderProps) => {
  const locale = useLocale();
  const [status, setStatus] = useState<SayoStatus | null>(null);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [health, setHealth] = useState<boolean | null>(null);
  const [modal, setModal] = useState<SayoModalState | null>(null);
  const [novel, setNovel] = useState<SayoNovelState | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const summaries = useRef(new Map<number, SayoSummary>());
  const summaryGeneration = useRef(0);
  const summaryCache = useMemo<SayoSummaryCache>(() => ({
    get: (id) => summaries.current.get(id),
    generation: () => summaryGeneration.current,
    set: (s, generation) => { if (generation === summaryGeneration.current) summaries.current.set(s.articleId, s); },
  }), []);
  const initialized = useRef(false);
  const consent = useSayoConsent();
  // 同意画面を出している間、同意のあとに続ける操作（要約を開く・探す）。null なら同意画面は出さない
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  /**
   * 利用規約に同意済みなら action をすぐ実行し、未同意なら同意画面を出して、同意のあとに実行する。
   * 同意する前は、要約・候補の取得（利用回数に数える通信）を始めない
   */
  const withConsent = useCallback((action: () => void) => {
    if (consent.agreed) { action(); return; }
    setPendingAction(() => action);
  }, [consent.agreed]);

  const agreeConsent = useCallback(() => {
    consent.agree();
    const action = pendingAction;
    setPendingAction(null);
    action?.();
  }, [consent, pendingAction]);

  const cancelConsent = useCallback(() => {
    setPendingAction(null);
    trigger.current?.focus();
  }, []);

  // フラグはマウント後に読む（CSR）。取得に失敗したら出さない
  useEffect(() => {
    if (locale !== 'ja') return undefined;
    let alive = true;
    client.getStatus(locale)
      .then((s) => { if (alive) setStatus(s); })
      .catch(() => { if (alive) setStatus(null); });
    return () => { alive = false; };
  }, [client, locale]);

  const visible = locale === 'ja' && status !== null && status.visible;

  const block = useMemo<SayoBlockReason>(() => {
    if (status?.paused) return 'paused';
    if (health === false) return 'closed';
    if (remaining <= 0) return 'limit';
    return null;
  }, [status, health, remaining]);

  const ensureHealth = useCallback(async () => {
    if (health !== null) return health;
    try {
      const h = await client.getHealth();
      setHealth(h.enabled);
      return h.enabled;
    } catch {
      // 確かめられないときは止めない（上限の最終判定は ai-chat 本体）
      return true;
    }
  }, [client, health]);

  const openSummary = useCallback((id: number, ids: number[], el?: HTMLElement | null) => {
    trigger.current = el ?? null;
    withConsent(() => {
      const list = ids.includes(id) ? ids : [id, ...ids];
      setNovel(null);
      setModal({ kind: 'summary', ids: list, index: list.indexOf(id), search: null });
    });
  }, [withConsent]);

  const runSearch = useCallback(async (search: SayoSearchState) => {
    const update = (patch: Partial<SayoSearchState>) => setModal((m) => (
      m && m.kind === 'search' && m.search.query === search.query ? { kind: 'search', search: { ...m.search, ...patch } } : m
    ));
    // 残り0回では、候補ボタンも新しく探さない（要約・候補も1日の利用回数に数えるため）
    if (remaining <= 0) { update({ failure: 'limit' }); return; }
    if (search.kind === 'free' && !(await ensureHealth())) { update({ failure: 'closed' }); return; }
    try {
      const result = search.kind === 'chip'
        ? await client.searchByMood({ label: search.query }, search.category)
        : await client.searchFree(search.query, search.category);
      if (result.remaining !== undefined) setRemaining(result.remaining);
      update({ result });
    } catch {
      update({ failure: 'error' });
    }
  }, [client, ensureHealth, remaining]);

  const openSearch = useCallback((query: string, kind: 'chip' | 'free', el?: HTMLElement | null) => {
    if (el !== undefined) trigger.current = el;
    withConsent(() => {
      const search: SayoSearchState = { query, kind, category, result: null };
      setNovel(null);
      setModal({ kind: 'search', search });
      void runSearch(search);
    });
  }, [category, runSearch, withConsent]);

  const showSummaryInSearch = useCallback((id: number) => {
    setModal((m) => {
      if (!m || m.kind !== 'search' || !m.search.result) return m;
      const ids = m.search.result.articles.map((a) => a.id);
      return { kind: 'summary', ids, index: Math.max(0, ids.indexOf(id)), search: m.search };
    });
  }, []);

  const backToSearch = useCallback(() => {
    setModal((m) => (m && m.kind === 'summary' && m.search ? { kind: 'search', search: m.search } : m));
  }, []);

  const step = useCallback((delta: number) => {
    setModal((m) => {
      if (!m || m.kind !== 'summary') return m;
      const index = m.index + delta;
      if (index < 0 || index >= m.ids.length) return m;
      return { ...m, index };
    });
  }, []);

  const openNovel = useCallback(() => {
    if (!modal) return;
    if (modal.kind === 'summary') setNovel({ kind: 'post', id: modal.ids[modal.index], search: modal.search });
    else setNovel({ kind: 'search', search: modal.search });
  }, [modal]);

  const talkAbout = useCallback((id: number) => {
    setNovel((n) => (n ? { kind: 'post', id, search: n.search } : n));
  }, []);

  const backFromNovel = useCallback(() => {
    if (!novel) return;
    if (novel.kind === 'search') {
      setModal({ kind: 'search', search: novel.search });
    } else {
      const ids = novel.search?.result?.articles.map((a) => a.id) ?? (modal && modal.kind === 'summary' ? modal.ids : []);
      const list = ids.includes(novel.id) ? ids : [...ids, novel.id];
      setModal({ kind: 'summary', ids: list, index: list.indexOf(novel.id), search: novel.search });
    }
    setNovel(null);
  }, [modal, novel]);

  const closeAll = useCallback(() => {
    summaries.current.clear();
    summaryGeneration.current += 1;
    setModal(null);
    setNovel(null);
    trigger.current?.focus();
  }, []);

  // 開いている間は後ろのページをスクロールさせない
  useEffect(() => {
    if (!modal && !novel && !pendingAction) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [modal, novel, pendingAction]);

  // 確認用の初期状態（表示できると分かってから一度だけ）
  useEffect(() => {
    if (!visible || !initial || initialized.current) return undefined;
    // 非同期にして、エフェクト内で同期的に setState しない（StrictModeの再実行でも一度だけ動くよう、実行時にフラグを立てる）
    const id = setTimeout(() => {
      initialized.current = true;
      if (initial.searchChip) { openSearch(initial.searchChip, 'chip'); return; }
      if (initial.summaryId === undefined) return;
      const ids = initial.ids ?? [initial.summaryId];
      setModal({ kind: 'summary', ids, index: Math.max(0, ids.indexOf(initial.summaryId)), search: null });
      if (initial.novel) setNovel({ kind: 'post', id: initial.summaryId, search: null });
    }, 0);
    return () => clearTimeout(id);
  }, [visible, initial, openSearch]);

  const value = useMemo<SayoContextValue>(() => ({
    client, summaryCache, status, visible, chips, category, remaining, setRemaining, block, ensureHealth,
    modal, novel, openSummary, openSearch, showSummaryInSearch, backToSearch, step, openNovel, backFromNovel, closeAll, talkAbout,
  }), [client, summaryCache, status, visible, chips, category, remaining, block, ensureHealth, modal, novel, openSummary, openSearch, showSummaryInSearch, backToSearch, step, openNovel, backFromNovel, closeAll, talkAbout]);

  return (
    <SayoContext.Provider value={value}>
      {children}
      {visible && modal && !novel && <SayoSummaryModal />}
      {visible && novel && <SayoNovelStage />}
      {visible && pendingAction && <SayoConsentModal onAgree={agreeConsent} onCancel={cancelConsent} />}
    </SayoContext.Provider>
  );
};
