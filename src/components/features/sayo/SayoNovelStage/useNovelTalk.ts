import { useCallback, useEffect, useState } from 'react';
import type { SayoContextValue, SayoNovelState } from '@/components/features/sayo/useSayo';
import type { SayoArticle, SayoExpression, SayoMessageResult, SayoMessageStatus } from '@/types/sayo';

export type NovelChoice = {
  label: string;
  /** 送る文。kind: 'mood' は候補ボタンの文言 */
  message: string;
  /** llm＝1回数える質問／mood＝気分タグで探し直す（数えない） */
  kind: 'llm' | 'mood';
};

export type NovelSystem = 'error' | 'session' | 'tooLong' | null;

export type NovelLog = { who: 'sayo' | 'user'; text: string };

export type NovelTexts = {
  thinking: string;
  openPost: (title: string, summary: string) => string;
  openSearch: (reply: string) => string;
  choices: (title: string) => NovelChoice[];
  moodLabel: (chip: string) => string;
};

export type NovelTalk = {
  speaker: 'sayo' | 'user';
  text: string;
  thinking: boolean;
  spoilerHidden: boolean;
  spoiler: boolean;
  reveal: () => void;
  expression: SayoExpression;
  shelf: SayoArticle[];
  currentId?: number;
  title: string;
  choices: NovelChoice[];
  busy: boolean;
  system: NovelSystem;
  log: NovelLog[];
  send: (choice: NovelChoice) => Promise<void>;
  retry: () => void;
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 返事の status ごとの扱い（switch を使わず表で引く） */
const SYSTEM_BY_STATUS: Partial<Record<SayoMessageStatus, NovelSystem>> = {
  error: 'error',
  session_expired: 'session',
  too_long: 'tooLong',
};

/** 返事の内容から表情を決める（作品あり→recommend、見つからない→sorry） */
const expressionFor = (r: SayoMessageResult): SayoExpression => {
  if (r.articles.length) return 'recommend';
  return r.status === 'no_match' ? 'sorry' : 'default';
};

/**
 * ノベル画面の会話の状態と操作。作品の話は承認済み要約から始め、質問は /message（LLM）へ。
 * 探した結果の話は棚に作品を並べ、候補ボタンで探し直せる（LLMなし）。
 */
export const useNovelTalk = (sayo: SayoContextValue, novel: SayoNovelState, texts: NovelTexts): NovelTalk => {
  const { client, setRemaining, ensureHealth, category, chips } = sayo;
  const [speaker, setSpeaker] = useState<'sayo' | 'user'>('sayo');
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(true);
  const [spoiler, setSpoiler] = useState(false);
  const [spoilerText, setSpoilerText] = useState<string | null>(null);
  const [expression, setExpression] = useState<SayoExpression>('recommend');
  const [shelf, setShelf] = useState<SayoArticle[]>([]);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [system, setSystem] = useState<NovelSystem>(null);
  const [log, setLog] = useState<NovelLog[]>([]);
  const [last, setLast] = useState<NovelChoice | null>(null);
  const [searchQuery, setSearchQuery] = useState(novel.kind === 'search' ? novel.search.query : '');

  const sayoSays = useCallback((line: string, expr: SayoExpression) => {
    setSpeaker('sayo'); setThinking(false); setExpression(expr); setText(line);
    setLog((l) => [...l, { who: 'sayo', text: line }]);
  }, []);

  const postId = novel.kind === 'post' ? novel.id : null;

  // 作品の話：承認済み要約から始める
  useEffect(() => {
    if (postId === null) return undefined;
    let alive = true;
    setThinking(true); setSpoiler(false); setSpoilerText(null); setSystem(null);
    client.getSummary(postId).then((s) => {
      if (!alive) return;
      setTitle(s.article.title);
      setShelf([s.article]);
      sayoSays(texts.openPost(s.article.title, s.summary), 'recommend');
    }).catch(() => { if (alive) { setThinking(false); setSystem('error'); } });
    return () => { alive = false; };
    // texts は描画ごとに作られるため依存に入れない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, postId, sayoSays]);

  // 探した結果の話：結果を棚に並べる
  useEffect(() => {
    if (novel.kind !== 'search' || !novel.search.result) return;
    setTitle(novel.search.query);
    setShelf(novel.search.result.articles);
    sayoSays(texts.openSearch(novel.search.result.reply), novel.search.result.articles.length ? 'recommend' : 'sorry');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novel.kind]);

  const showUser = async (line: string) => {
    setSystem(null); setSpoiler(false); setSpoilerText(null);
    setSpeaker('user'); setThinking(false); setText(line);
    setLog((l) => [...l, { who: 'user', text: line }]);
    await wait(400);
    setSpeaker('sayo'); setThinking(true); setExpression('thinking');
  };

  const applyMessage = (r: SayoMessageResult, current: SayoArticle | undefined) => {
    setRemaining(r.remaining);
    const sys = SYSTEM_BY_STATUS[r.status];
    if (sys) { setThinking(false); setExpression('sorry'); setSystem(sys); return; }
    if (r.status.startsWith('limit') || r.status === 'disabled') { setThinking(false); setExpression('sorry'); setText(''); return; }
    setShelf([...(current ? [current] : []), ...r.articles]);
    if (r.spoiler) {
      setThinking(false); setSpoiler(true); setSpoilerText(r.reply); setExpression('secret'); setText('');
      setLog((l) => [...l, { who: 'sayo', text: r.reply }]);
      return;
    }
    sayoSays(r.reply, expressionFor(r));
  };

  /** 選択肢・入力を1つ処理する。早期 return で分岐する */
  const runChoice = async (choice: NovelChoice) => {
    if (choice.kind === 'mood') {
      const r = await client.searchByMood({ label: choice.message }, category);
      setSearchQuery(choice.message); setTitle(choice.message); setShelf(r.articles);
      sayoSays(texts.openSearch(r.reply), r.articles.length ? 'recommend' : 'sorry');
      return;
    }
    if (!(await ensureHealth())) { setThinking(false); setExpression('sorry'); setText(''); return; }
    if (postId === null) {
      const r = await client.searchFree(choice.message, category);
      if (r.remaining !== undefined) setRemaining(r.remaining);
      setShelf(r.articles);
      sayoSays(texts.openSearch(r.reply), r.articles.length ? 'recommend' : 'sorry');
      return;
    }
    const r = await client.sendMessage({ message: choice.message, articleId: postId });
    applyMessage(r, shelf.find((a) => a.id === postId));
  };

  const send = async (choice: NovelChoice) => {
    if (busy) return;
    setBusy(true); setLast(choice);
    await showUser(choice.label);
    try {
      await runChoice(choice);
    } catch {
      setThinking(false); setExpression('sorry'); setSystem('error');
    } finally {
      setBusy(false);
    }
  };

  const reveal = () => {
    if (spoilerText === null) return;
    setText(spoilerText); setSpoilerText(null);
  };

  const choices: NovelChoice[] = postId !== null
    ? texts.choices(title)
    : chips.filter((c) => c !== searchQuery).map((c) => ({ label: texts.moodLabel(c), message: c, kind: 'mood' }));

  return {
    speaker, text, thinking, spoiler, spoilerHidden: spoilerText !== null, reveal, expression, shelf,
    currentId: postId ?? undefined, title, choices, busy, system, log,
    send, retry: () => { if (last) void send(last); },
  };
};
