import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Image from 'next/image';
import { SAYO_FULL_SIZE, sayoFullSrc } from '@/libs/sayoAssets';
import { SayoChoice } from '@/components/ui-parts/SayoChoice';
import { SayoNovelWindow } from '@/components/ui-section/SayoNovelWindow';
import { SayoShelf } from '@/components/ui-section/SayoShelf';
import { SayoPausedNotice } from '@/components/ui-section/SayoPausedNotice';
import { useSayo } from '@/components/features/sayo/useSayo';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { useNovelTalk } from './useNovelTalk';
import type { NovelTexts } from './useNovelTalk';
import { useTypewriter } from './useTypewriter';
import { messages } from './i18n';

/**
 * ノベル風の画面（案C）。「詳しく知りたい」で開く。
 * 立ち絵・名前札つきウィンドウ・1文字ずつの返事・棚の作品・選択肢・自由入力・履歴。
 */
export const SayoNovelStage = () => {
  const sayo = useSayo();
  const locale = useLocale();
  const m = (path: string[]) => t(messages, path, locale);
  const novel = sayo.novel;
  const backRef = useRef<HTMLButtonElement>(null);
  const [logOpen, setLogOpen] = useState(false);

  const scopeText = sayo.category ? `${sayo.category}${m(['open', 'searchScoped'])}` : m(['open', 'searchAll']);
  const texts: NovelTexts = {
    thinking: m(['thinking']),
    openPost: (title, summary) => `『${title}』${m(['open', 'post'])}\n${summary}\n${m(['open', 'postEnd'])}`,
    openSearch: (reply) => `${reply}\n${scopeText}`,
    choices: (title) => [
      { label: m(['choice', 'highlight']), message: `『${title}』の見どころをもう少し`, kind: 'llm' },
      { label: m(['choice', 'similar']), message: `『${title}』に似た作品は？`, kind: 'llm' },
      { label: m(['choice', 'weak']), message: `『${title}』の惜しいところは？`, kind: 'llm' },
      { label: m(['choice', 'ending']), message: `『${title}』の結末を教えて`, kind: 'llm' },
    ],
    moodLabel: (chip) => `${m(['choice', 'searchPrefix'])}${chip}${m(['choice', 'searchSuffix'])}`,
  };
  // novel が null のときは SayoProvider が描かない
  const talk = useNovelTalk(sayo, novel ?? { kind: 'post', id: 0, search: null }, texts);
  const typed = useTypewriter(talk.thinking ? '' : talk.text);

  useEffect(() => { backRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') sayo.backFromNovel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sayo]);

  if (!novel) return null;

  const isPost = novel.kind === 'post';
  const llmBlocked = sayo.block !== null;
  const heading = isPost
    ? `${m(['title', 'postPrefix'])}${talk.title}${m(['title', 'postSuffix'])}`
    : `${m(['title', 'searchPrefix'])}${talk.title}${m(['title', 'searchSuffix'])}`;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('sayo-novel') as HTMLInputElement | null;
    const value = input?.value.trim() ?? '';
    if (!value || llmBlocked) return;
    void talk.send({ label: value, message: value, kind: 'llm' });
    if (input) input.value = '';
  };

  const windowBody = () => {
    if (talk.thinking) return <span className='sayoNovelStage__thinking'>{m(['thinking'])}</span>;
    if (talk.spoilerHidden) {
      return (
        <>
          {m(['spoiler', 'hidden'])}
          <button type='button' className='sayoNovelStage__reveal' onClick={talk.reveal}>{m(['spoiler', 'reveal'])}</button>
        </>
      );
    }
    return typed.shown;
  };

  return (
    <div data-component='SayoNovelStage' className='sayoNovelStage' role='dialog' aria-modal='true' aria-labelledby='sayoNovelTitle'>
      <div className='sayoNovelStage__stage' data-expression={talk.expression}>
        <Image src={sayoFullSrc(talk.expression)} alt='' width={SAYO_FULL_SIZE.width} height={SAYO_FULL_SIZE.height} className='sayoNovelStage__blur' />
        <Image src={sayoFullSrc(talk.expression)} alt={m(['stageAlt'])} width={SAYO_FULL_SIZE.width} height={SAYO_FULL_SIZE.height} className='sayoNovelStage__bg' />
      </div>

      <div className='sayoNovelStage__hud'>
        <button ref={backRef} type='button' className='sayoNovelStage__pill sayoNovelStage__back' onClick={sayo.backFromNovel}>
          {m(['back', isPost ? 'post' : 'search'])}
        </button>
        <h2 className='sayoNovelStage__title' id='sayoNovelTitle'>{heading}</h2>
        <span className='sayoNovelStage__pill'>{m(['remaining'])} <strong>{sayo.remaining}</strong></span>
        <button type='button' className='sayoNovelStage__pill' onClick={() => setLogOpen(true)} aria-controls='sayoNovelLog'>{m(['log'])}</button>
        <button type='button' className='sayoNovelStage__pill' onClick={sayo.closeAll} aria-label={m(['close'])}>✕</button>
      </div>

      <div className='sayoNovelStage__bottom'>
        <div className='sayoNovelStage__inner'>
          <SayoShelf articles={talk.shelf} currentId={talk.currentId} onTalk={sayo.talkAbout} />
          <SayoNovelWindow
            speaker={talk.speaker}
            spoiler={talk.spoiler}
            done={!talk.thinking && !talk.spoilerHidden && typed.done}
            onClick={typed.skip}
          >
            {windowBody()}
          </SayoNovelWindow>
          {talk.system && (
            <p className='sayoNovelStage__system' role='alert'>
              {m(['system', talk.system])}
              {talk.system === 'error' && <button type='button' onClick={talk.retry}>{m(['system', 'retry'])}</button>}
            </p>
          )}
          {llmBlocked && sayo.block && (
            <SayoPausedNotice
              reason={sayo.block}
              tone='dark'
              message={sayo.block === 'paused' ? sayo.status?.message : null}
              resumeAt={sayo.block === 'paused' ? sayo.status?.resumeAt : null}
            />
          )}
          <div className='sayoNovelStage__choices'>
            {talk.choices.filter((c) => c.kind === 'mood' || !llmBlocked).map((c) => (
              <SayoChoice key={c.message} label={c.label} onClick={() => void talk.send(c)} disabled={talk.busy} />
            ))}
          </div>
          {!llmBlocked && (
            <form className='sayoNovelStage__reply' onSubmit={onSubmit}>
              <label className='sayoNovelStage__srOnly' htmlFor='sayoNovelInput'>{m(['input', 'label'])}</label>
              <input id='sayoNovelInput' name='sayo-novel' maxLength={200} autoComplete='off' placeholder={m(['input', 'placeholder'])} />
              <button type='submit' disabled={talk.busy}>{m(['input', 'send'])}</button>
            </form>
          )}
          <p className='sayoNovelStage__note'>{m(['note'])}</p>
        </div>
      </div>

      <aside id='sayoNovelLog' className={`sayoNovelStage__log${logOpen ? ' is-open' : ''}`} aria-label={m(['logTitle'])} aria-hidden={!logOpen}>
        <div className='sayoNovelStage__logHead'>
          <span>{m(['logTitle'])}</span>
          <button type='button' className='sayoNovelStage__pill' onClick={() => setLogOpen(false)} aria-label={m(['closeLog'])}>✕</button>
        </div>
        <div className='sayoNovelStage__logBody'>
          {talk.log.map((l, i) => (
            // 同じ文が続くことがあるため、並び順を key に含める
            <div key={`${i}-${l.who}`}>
              <span className={`sayoNovelStage__logWho${l.who === 'user' ? ' sayoNovelStage__logWho--user' : ''}`}>{m([l.who === 'user' ? 'you' : 'sayo'])}</span>
              {l.text}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};
