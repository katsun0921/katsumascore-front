import { useEffect, useState } from 'react';
import { devToolsStore } from '@/libs/devtools';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { devToolsPanels } from './DevToolsBox.config';
import { messages } from './i18n';

export type DevToolsBoxProps = {
  /** 最初から開いておく（Storybook・確認用） */
  defaultOpen?: boolean;
};

/**
 * 開発者ツールの箱（ローカル確認用）。画面の隅のボタンから開き、機能ごとのパネルを切り替える。
 * ai-chatへの通信を避けて画面を確認するため（UI確認＝mock／API疎通確認）。開発サーバー以外では何も描かない。
 * パネルは `DevToolsBox.config.ts` の一覧で足す
 */
export const DevToolsBox = ({ defaultOpen = false }: DevToolsBoxProps) => {
  const locale = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState(devToolsPanels[0]?.id ?? '');

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!devToolsStore.enabled || devToolsPanels.length === 0) return null;
  const active = devToolsPanels.find((p) => p.id === activeId) ?? devToolsPanels[0];
  const ActivePanel = active.Panel;

  return (
    <aside data-component='DevToolsBox' className='devToolsBox'>
      {open && (
        <section className='devToolsBox__sheet' role='dialog' aria-label={t(messages, ['title'], locale)}>
          <header className='devToolsBox__head'>
            <strong>{t(messages, ['title'], locale)}</strong>
            <button type='button' className='devToolsBox__close' onClick={() => setOpen(false)} aria-label={t(messages, ['close'], locale)}>✕</button>
          </header>
          <p className='devToolsBox__note'>{t(messages, ['localOnly'], locale)}</p>
          <div className='devToolsBox__tabs' role='tablist'>
            {devToolsPanels.map((p) => (
              <button
                key={p.id}
                type='button'
                role='tab'
                aria-selected={p.id === active.id}
                className={`devToolsBox__tab${p.id === active.id ? ' is-active' : ''}`}
                onClick={() => setActiveId(p.id)}
              >
                {p.title}
              </button>
            ))}
          </div>
          <div className='devToolsBox__body' role='tabpanel'>
            <ActivePanel />
          </div>
        </section>
      )}
      <button type='button' className='devToolsBox__toggle' onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t(messages, ['toggle'], locale)}>
        DEV
      </button>
    </aside>
  );
};
