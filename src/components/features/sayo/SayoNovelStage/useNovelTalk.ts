import { useCallback, useEffect, useRef, useState } from 'react';
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

/** 会話ログの1行。hidden は、利用者が「表示する」を押すまで本文を伏せるネタバレ */
export type NovelLog = { who: 'sayo' | 'user'; text: string; hidden?: boolean; id?: number };

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
  const { client, setRemaining, ensureHealth, category, chips, remaining } = sayo;
  const [speaker, setSpeaker] = useState<'sayo' | 'user'>('sayo');
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(true);
  const [spoiler, setSpoiler] = useState(false);
  const [spoilerText, setSpoilerText] = useState<string | null>(null);
  // 「表示する」で開示する履歴の行（いま伏せている返事の分だけ）
  const [spoilerLogId, setSpoilerLogId] = useState<number | null>(null);
  const logSeq = useRef(0);
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
  // 返事が届いたときに「いま話している作品」を読むための参照（作品を切り替えたあとの古い返事を捨てる）
  // 同じ作品に戻っても古い返事を捨てられるよう、作品が変わるたびに世代（epoch）を進めて比べる
  const epochRef = useRef(0);
  useEffect(() => { epochRef.current += 1; }, [postId]);
  // 残り回数は取得の直前に読む（依存に入れると回数が変わるたびに読み直してしまう）
  const remainingRef = useRef(remaining);
  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  // 作品が切り替わったら表示を考え中に戻す（エフェクト内で同期的に setState しないよう描画中に行う）
  const [prevPostId, setPrevPostId] = useState(postId);
  if (prevPostId !== postId) {
    setPrevPostId(postId);
    // 送信中だった古い作品の処理は結果を捨てるので、新しい作品では送れる状態に戻す
    if (postId !== null) { setThinking(true); setSpoiler(false); setSpoilerText(null); setSpoilerLogId(null); setSystem(null); setBusy(false); }
  }

  // 作品の話：承認済み要約から始める
  useEffect(() => {
    if (postId === null) return undefined;
    // 残り0回では、新しい要約を取りに行かない（要約も1日の利用回数に数えるため）
    if (remainingRef.current <= 0) {
      const id = setTimeout(() => { setThinking(false); setExpression('sorry'); setText(''); }, 0);
      return () => clearTimeout(id);
    }
    let alive = true;
    client.getSummary(postId).then((s) => {
      if (!alive) return;
      if (s.remaining !== undefined) setRemaining(s.remaining);
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
    if (novel.kind !== 'search' || !novel.search.result) return undefined;
    const { query, result } = novel.search;
    const id = setTimeout(() => {
      setTitle(query);
      setShelf(result.articles);
      sayoSays(texts.openSearch(result.reply), result.articles.length ? 'recommend' : 'sorry');
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novel.kind]);

  /** 利用者の発言を出して、考え中に切り替える。待つあいだに作品が変わったら false（以降の処理を止める） */
  const showUser = async (line: string, stale: () => boolean): Promise<boolean> => {
    setSystem(null); setSpoiler(false); setSpoilerText(null);
    setSpeaker('user'); setThinking(false); setText(line);
    setLog((l) => [...l, { who: 'user', text: line }]);
    await wait(400);
    if (stale()) return false;
    setSpeaker('sayo'); setThinking(true); setExpression('thinking');
    return true;
  };

  const applyMessage = (r: SayoMessageResult, current: SayoArticle | undefined) => {
    setRemaining(r.remaining);
    const sys = SYSTEM_BY_STATUS[r.status];
    if (sys) { setThinking(false); setExpression('sorry'); setSystem(sys); return; }
    if (r.status.startsWith('limit') || r.status === 'disabled') { setThinking(false); setExpression('sorry'); setText(''); return; }
    setShelf([...(current ? [current] : []), ...r.articles]);
    if (r.spoiler) {
      setThinking(false); setSpoiler(true); setSpoilerText(r.reply); setExpression('secret'); setText('');
      // 履歴にも本文を出さない。「表示する」を押したとき（reveal）に、この返事の行だけ開示する
      logSeq.current += 1;
      const id = logSeq.current;
      setSpoilerLogId(id);
      setLog((l) => [...l, { who: 'sayo', text: r.reply, hidden: true, id }]);
      return;
    }
    sayoSays(r.reply, expressionFor(r));
  };

  /** 選択肢・入力を1つ処理する。早期 return で分岐する */
  const runChoice = async (choice: NovelChoice, stale: () => boolean) => {
    // 残り0回では、候補ボタンも含めて新しく取得しない
    if (remainingRef.current <= 0) { setThinking(false); setExpression('sorry'); setText(''); return; }
    if (choice.kind === 'mood') {
      const r = await client.searchByMood({ label: choice.message }, category);
      if (r.remaining !== undefined) setRemaining(r.remaining);
      if (stale()) return;
      setSearchQuery(choice.message); setTitle(choice.message); setShelf(r.articles);
      sayoSays(texts.openSearch(r.reply), r.articles.length ? 'recommend' : 'sorry');
      return;
    }
    if (!(await ensureHealth())) {
      if (stale()) return;
      setThinking(false); setExpression('sorry'); setText(''); return;
    }
    if (postId === null) {
      const r = await client.searchFree(choice.message, category);
      if (r.remaining !== undefined) setRemaining(r.remaining);
      if (stale()) return;
      setShelf(r.articles);
      sayoSays(texts.openSearch(r.reply), r.articles.length ? 'recommend' : 'sorry');
      return;
    }
    const r = await client.sendMessage({ message: choice.message, articleId: postId });
    if (stale()) { setRemaining(r.remaining); return; }
    applyMessage(r, shelf.find((a) => a.id === postId));
  };

  const send = async (choice: NovelChoice) => {
    if (busy) return;
    // 返事を待つあいだに作品が切り替わったら（A→B→A と戻った場合も）、その返事で画面を上書きしない。回数だけ反映する
    const startEpoch = epochRef.current;
    const stale = () => epochRef.current !== startEpoch;
    setBusy(true); setLast(choice);
    if (!(await showUser(choice.label, stale))) return;
    try {
      await runChoice(choice, stale);
    } catch {
      // 切り替え前の作品の失敗は、いまの作品に出さない
      if (!stale()) { setThinking(false); setExpression('sorry'); setSystem('error'); }
    } finally {
      // 切り替え後は busy を別の送信が持っているので触らない
      if (!stale()) setBusy(false);
    }
  };

  const reveal = () => {
    if (spoilerText === null) return;
    setText(spoilerText); setSpoilerText(null);
    setLog((l) => l.map((x) => (x.id === spoilerLogId ? { ...x, hidden: false } : x)));
    setSpoilerLogId(null);
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
