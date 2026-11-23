/*
 * 案B（フローティングウィジェット）を任意のページに置くためのスクリプト（ui-proposals専用）
 *
 * 置き場所モック place-b.html から使う。TOP・リストだけに出す前提で、ページごとに
 * 吹き出しの一言と最初の挨拶を変えられる。会話は mock.js の SayoMock.send（/message 相当）。
 *
 *   SayoWidget.mount({ teaser: '…', greeting: '…', chips: ['…'] })
 */
(() => {
  const css = `
    .bw { --bw-bg: #0a0618; --bw-surface: #1a1030; --bw-surface2: #241843; --bw-line: #34285a; --bw-text: #ffffff; --bw-dim: #b7aed1;
      --bw-accent: #6d28d9; --bw-strong: #ff2dfc; --bw-soft: #c084fc; --bw-warn: #fbbf24; --bw-warn-bg: #3a2a07; --bw-score: #14082e;
      font-family: 'Noto Sans JP', sans-serif; }
    .bw * { box-sizing: border-box; }
    .bw__launcher { position: fixed; right: 16px; bottom: 16px; z-index: 60; display: flex; align-items: flex-end; gap: 10px; }
    .bw__teaser { background: var(--bw-surface); color: var(--bw-text); font-size: 13px; line-height: 1.6; padding: 8px 12px; border-radius: 14px 14px 4px 14px;
      width: max-content; max-width: calc(100vw - 112px); box-shadow: 0 8px 24px rgba(0,0,0,.3); border: 1px solid var(--bw-line); animation: bwPop .4s ease .6s both; }
    .bw__teaser small { display: block; color: var(--bw-dim); font-size: 11px; }
    .bw__teaserClose { all: unset; cursor: pointer; margin-left: 8px; color: var(--bw-dim); font-size: 11px; }
    @keyframes bwPop { from { opacity: 0; transform: translateY(8px); } }
    .bw__btn { all: unset; cursor: pointer; position: relative; width: 64px; height: 64px; border-radius: 50%; padding: 3px; background: var(--bw-surface);
      box-shadow: 0 0 0 2px var(--bw-strong), 0 10px 28px rgba(255,45,252,.35); transition: transform .2s; }
    .bw__btn:hover { transform: translateY(-2px); }
    .bw__btn:focus-visible { outline: 3px solid var(--bw-soft); outline-offset: 4px; }
    .bw__btn img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
    .bw__dot { position: absolute; right: 2px; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--bw-strong); border: 2px solid var(--bw-surface); }
    .bw.is-open .bw__launcher { display: none; }
    .bw__panel { position: fixed; z-index: 70; inset: 0; background: var(--bw-bg); color: var(--bw-text); display: flex; flex-direction: column;
      transform: translateY(100%); visibility: hidden; transition: transform .35s cubic-bezier(.2,.8,.2,1); line-height: 1.7; }
    .bw.is-open .bw__panel { transform: none; visibility: visible; }
    @media (min-width: 768px) {
      .bw__panel { inset: auto 24px 24px auto; width: 400px; height: min(620px, calc(100vh - 48px)); border-radius: 20px; overflow: hidden;
        border: 1px solid var(--bw-line); box-shadow: 0 24px 64px rgba(0,0,0,.5); transform: translateY(16px); opacity: 0; transition: transform .25s, opacity .25s; }
      .bw.is-open .bw__panel { opacity: 1; }
    }
    .bw__head { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: linear-gradient(90deg, #1e1b4b, var(--bw-surface)); border-bottom: 1px solid var(--bw-line); }
    .bw__face { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--bw-soft); }
    .bw__who { flex: 1; min-width: 0; font-size: 11px; color: var(--bw-dim); }
    .bw__who strong { display: block; font-size: 15px; color: var(--bw-text); line-height: 1.3; }
    .bw__remain { font-size: 11px; color: var(--bw-dim); text-align: right; line-height: 1.3; }
    .bw__remain strong { display: block; font-size: 16px; color: var(--bw-text); }
    .bw__close { all: unset; cursor: pointer; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; font-size: 18px; }
    .bw__close:hover, .bw__close:focus-visible { background: var(--bw-surface2); }
    .bw__log { flex: 1; overflow-y: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 12px; }
    .bw__bubble { max-width: 88%; padding: 9px 13px; font-size: 14px; border-radius: 4px 14px 14px 14px; background: var(--bw-surface2); white-space: pre-wrap; animation: bwPop .25s ease; }
    .bw__bubble--user { align-self: flex-end; background: var(--bw-accent); border-radius: 14px 4px 14px 14px; }
    .bw__row { display: flex; gap: 10px; align-items: center; padding: 8px; border-radius: 12px; background: var(--bw-surface); border: 1px solid var(--bw-line); color: inherit; text-decoration: none; }
    .bw__row:hover { border-color: var(--bw-strong); }
    .bw__thumb { width: 64px; aspect-ratio: 16/9; border-radius: 6px; flex: none; }
    .bw__rowBody { flex: 1; min-width: 0; font-size: 10px; color: var(--bw-dim); }
    .bw__rowBody strong { display: block; font-size: 13px; color: var(--bw-text); }
    .bw__score { width: 38px; height: 38px; border-radius: 50%; flex: none; display: grid; place-items: center; text-align: center; background: var(--bw-score); border: 2px solid var(--bw-strong); font-size: 12px; font-weight: 700; line-height: 1; }
    .bw__score small { display: block; font-size: 8px; color: var(--bw-strong); }
    .bw__sys { font-size: 12px; background: var(--bw-warn-bg); color: var(--bw-warn); border-radius: 10px; padding: 10px 12px; }
    .bw__dots { display: inline-flex; gap: 4px; } .bw__dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--bw-soft); animation: bwBlink 1s infinite; }
    .bw__dots i:nth-child(2) { animation-delay: .15s; } .bw__dots i:nth-child(3) { animation-delay: .3s; }
    @keyframes bwBlink { 50% { opacity: .2; } }
    .bw__foot { border-top: 1px solid var(--bw-line); padding: 8px 10px calc(8px + env(safe-area-inset-bottom)); }
    .bw__chips { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; }
    .bw__chip { all: unset; cursor: pointer; white-space: nowrap; font-size: 12px; padding: 3px 10px; border-radius: 999px; border: 1px solid var(--bw-line); color: var(--bw-dim); }
    .bw__chip:hover, .bw__chip:focus-visible { border-color: var(--bw-soft); color: var(--bw-text); }
    .bw__compose { display: flex; gap: 6px; align-items: center; background: var(--bw-surface); border: 1px solid var(--bw-line); border-radius: 999px; padding: 4px 4px 4px 14px; }
    .bw__input { flex: 1; min-width: 0; background: transparent; border: 0; outline: 0; color: var(--bw-text); font: inherit; font-size: 16px; padding: 6px 0; }
    .bw__input::placeholder { color: var(--bw-dim); }
    .bw__send { all: unset; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--bw-strong); color: var(--bw-bg); font-weight: 700; }
    .bw__send:disabled { opacity: .3; }
    .bw__note { font-size: 10px; color: var(--bw-dim); text-align: center; margin: 6px 0 0; }
  `;

  /** ウィジェットを body に追加する */
  const mount = ({ teaser, teaserSub = 'サヨ ／ AI映画店主', greeting, chips }) => {
    const M = window.SayoMock;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    const root = document.createElement('div');
    root.className = 'bw';
    root.innerHTML = `
      <div class="bw__launcher">
        <div class="bw__teaser" data-teaser>${teaser}<button type="button" class="bw__teaserClose" aria-label="吹き出しを閉じる">✕</button><small>${teaserSub}</small></div>
        <button type="button" class="bw__btn" data-open aria-label="サヨと話す（チャットを開く）"><img src="img/sayo-face.webp" alt=""><span class="bw__dot" aria-hidden="true"></span></button>
      </div>
      <section class="bw__panel" role="dialog" aria-label="サヨとの会話">
        <header class="bw__head"><img class="bw__face" src="img/sayo-face.webp" alt=""><div class="bw__who"><strong>サヨ</strong>AI映画店主</div>
          <div class="bw__remain">今日あと<strong data-remaining>30</strong></div><button type="button" class="bw__close" data-close aria-label="閉じる">✕</button></header>
        <div class="bw__log" data-log role="log" aria-live="polite"></div>
        <form class="bw__foot" data-form>
          <div class="bw__chips">${chips.map((c) => `<button type="button" class="bw__chip">${c}</button>`).join('')}</div>
          <div class="bw__compose"><input class="bw__input" data-input maxlength="200" placeholder="サヨに話しかける" aria-label="サヨへのメッセージ"><button class="bw__send" type="submit" aria-label="送る">↑</button></div>
          <p class="bw__note">${M.DISCLAIMER}</p>
        </form>
      </section>`;
    document.body.appendChild(root);
    const $ = (s) => root.querySelector(s);
    const log = $('[data-log]');
    let started = false;
    let busy = false;
    const add = (cls, html) => { const el = document.createElement('div'); el.className = cls; el.innerHTML = html; log.appendChild(el); log.scrollTop = log.scrollHeight; return el; };
    const row = (a) => `<a class="bw__row" href="${a.url}"><span class="bw__thumb" style="background:linear-gradient(135deg,hsl(${a.hue} 45% 32%),hsl(${a.hue + 30} 55% 55%))"></span>
      <span class="bw__rowBody"><strong>${a.title}</strong>${a.category} ・ ${a.vod.join(' / ')}（${a.vodCheckedAt}時点）</span>
      <span class="bw__score"><span>${a.katsumaScore.toFixed(1)}<small>${M.scoreRank(a.katsumaScore)}</small></span></span></a>`;

    const send = async (text) => {
      if (!text || busy) return;
      busy = true;
      add('bw__bubble bw__bubble--user', M.escapeHtml(text));
      $('[data-input]').value = '';
      const t = add('bw__bubble', '<span class="bw__dots"><i></i><i></i><i></i></span>');
      const { body } = await M.send(text);
      t.remove();
      busy = false;
      $('[data-remaining]').textContent = body.remaining;
      if (body.status === 'ok' || body.status === 'no_match') {
        add('bw__bubble', (body.spoiler ? '【ネタバレあり】\n' : '') + M.escapeHtml(body.reply));
        body.articles.forEach((a) => add('', row(a)));
      } else {
        const info = M.STATUS_MESSAGE[body.status];
        add('bw__sys', `<strong>${info.title}</strong><br>${info.body || ''}`);
      }
    };
    const open = () => {
      root.classList.add('is-open');
      if (!started) { started = true; add('bw__bubble', greeting || M.greeting()); }
      setTimeout(() => $('[data-input]').focus(), 300);
    };
    $('[data-open]').addEventListener('click', open);
    $('[data-close]').addEventListener('click', () => { root.classList.remove('is-open'); $('[data-open]').focus(); });
    $('.bw__teaserClose').addEventListener('click', () => $('[data-teaser]').remove());
    root.querySelectorAll('.bw__chip').forEach((b) => b.addEventListener('click', () => { open(); send(b.textContent); }));
    $('[data-form]').addEventListener('submit', (e) => { e.preventDefault(); send($('[data-input]').value.trim()); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('is-open')) root.classList.remove('is-open'); });
    return { open };
  };

  window.SayoWidget = { mount };
})();
