/*
 * 置き場所比較用：TOPページとリストページの「土台」を描くスクリプト（ui-proposals専用）
 *
 * 案A〜Cの入口をTOP・リストに置いた見え方を比べるために使う。
 * 実際の HomeTemplate / ListTemplate を簡略化した見た目で、作品はすべて架空（card-mock.js）。
 *
 * 使い方：
 *   SayoHost.render(rootEl, { view: 'top' | 'list', slots: { afterHero, listTop }, nav: '...' })
 *   slots には各案の入口のHTML文字列を入れる。
 */
(() => {
  const css = `
    :root {
      --color-secondary: #1e1b4b; --color-accent: #6d28d9; --color-accent-strong: #ff2dfc; --color-accent-soft: #c084fc;
      --color-bg: #ffffff; --color-bg-muted: #f3f4f6; --color-bg-dark: #0a0618; --color-surface-dark: #1a1030; --color-surface-dark-2: #241843;
      --color-text-primary: #111827; --color-text-secondary: #6b7280; --color-text-inverse: #ffffff; --color-text-dim: #b7aed1;
      --color-border: #d1d5db; --color-border-dark: #34285a; --color-score-bg: #14082e;
      --color-unext: #1a1a1a; --color-netflix: #e50914; --color-amazon: #00a8e1; --color-dmmtv: #ff4b00; --color-disney: #113ccf; --color-hulu: #1ce783;
      --color-black-rgb: 0, 0, 0; --color-white-rgb: 255, 255, 255; --color-accent-strong-rgb: 255, 45, 252;
    }
    .host * { box-sizing: border-box; }
    .host { font-family: 'Noto Sans JP', sans-serif; color: var(--color-text-primary); line-height: 1.7; }
    :where(.host) a { color: inherit; text-decoration: none; } /* 詳細度0：各案のリンク色を上書きしない */
    .hostHeader { background: var(--color-secondary); color: var(--color-text-inverse); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
    .hostHeader__logo { font-weight: 700; letter-spacing: .04em; }
    .hostHeader__nav { display: none; gap: 20px; font-size: 13px; opacity: .85; }
    .hostHeader__nav b { color: var(--color-accent-soft); }
    @media (min-width: 768px) { .hostHeader__nav { display: flex; } }

    /* TOP */
    .hostTop { background: var(--color-bg-dark); color: var(--color-text-inverse); padding-bottom: 48px; }
    .hostHero { position: relative; height: 300px; display: flex; align-items: flex-end; padding: 24px 16px; overflow: hidden; }
    @media (min-width: 768px) { .hostHero { height: 380px; padding: 40px; } }
    .hostHero__bg { position: absolute; inset: 0; }
    .hostHero__bg::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, var(--color-bg-dark), transparent 70%); }
    .hostHero__body { position: relative; max-width: 560px; }
    .hostHero__eyebrow { font-size: 11px; letter-spacing: .2em; color: var(--color-accent-strong); }
    .hostHero__title { font-size: 28px; line-height: 1.3; margin: 4px 0; font-weight: 700; }
    .hostHero__lead { font-size: 13px; color: var(--color-text-dim); }
    .hostSection { padding: 16px 0 20px; }
    .hostSection__head { display: flex; justify-content: space-between; align-items: baseline; padding: 0 16px 12px; }
    .hostSection__title { font-size: 18px; font-weight: 700; margin: 0; }
    .hostSection__title small { display: block; font-size: 10px; letter-spacing: .2em; color: var(--color-accent-strong); }
    .hostSection__more { font-size: 12px; color: var(--color-text-dim); }
    .hostScroll { display: flex; gap: 12px; overflow-x: auto; padding: 4px 16px 8px; margin: 0; list-style: none; scrollbar-width: none; }
    .hostCard { position: relative; flex: 0 0 160px; }
    .hostCard__media { position: relative; width: 160px; height: 218px; border-radius: 10px; overflow: hidden; }
    .hostCard__title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 12px; font-weight: 600; line-height: 1.4; margin-top: 8px; }
    .hostCard__cat { font-size: 10px; color: var(--color-text-secondary); }
    .hostHex { position: absolute; top: 8px; left: 8px; width: 38px; height: 42px; display: grid; place-items: center; text-align: center; background: var(--color-score-bg); font-size: 12px; font-weight: 700; line-height: 1; clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); color: var(--color-text-inverse); }
    .hostHex small { display: block; font-size: 8px; color: var(--color-accent-strong); }
    .hostDots { position: absolute; right: 8px; bottom: 8px; display: flex; gap: 3px; }
    .hostDots i { width: 8px; height: 8px; border-radius: 50%; border: 1px solid rgba(var(--color-white-rgb), .8); }

    /* リスト */
    .hostList__hero { background: var(--color-secondary); color: var(--color-text-inverse); padding: 32px 16px; }
    .hostList__eyebrow { font-size: 11px; letter-spacing: .2em; color: var(--color-accent-strong); margin: 0; }
    .hostList__h1 { font-size: 26px; margin: 0; }
    .hostList__desc { font-size: 13px; color: rgba(var(--color-white-rgb), .7); margin: 4px 0 0; }
    .hostFilter { padding: 12px 16px; border-bottom: 1px solid var(--color-border); display: flex; gap: 6px; overflow-x: auto; background: var(--color-bg); }
    .hostFilter span { font-size: 12px; padding: 3px 12px; border-radius: 999px; border: 1px solid var(--color-border); white-space: nowrap; }
    .hostFilter span:first-child { background: var(--color-secondary); color: var(--color-text-inverse); border-color: var(--color-secondary); }
    .hostList__body { max-width: 1120px; margin: 0 auto; padding: 24px 16px 64px; display: flex; flex-direction: column; gap: 16px; background: var(--color-bg); }
    .hostPost { position: relative; border-radius: 12px; overflow: hidden; background: var(--color-bg); border: 1px solid var(--color-border); }
    .hostPost__link { display: grid; }
    .hostPost__media { aspect-ratio: 16/9; }
    .hostPost__body { padding: 10px 12px 14px; display: flex; flex-direction: column; gap: 4px; }
    .hostPost__date { font-size: 11px; color: var(--color-text-secondary); }
    .hostPost__title { font-size: 14px; font-weight: 700; line-height: 1.45; }
    .hostPost__excerpt { font-size: 12px; color: var(--color-text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    @media (min-width: 768px) {
      .hostPost--lead .hostPost__link { grid-template-columns: 1.2fr 1fr; }
      .hostPost--lead .hostPost__body { padding: 20px 24px; justify-content: center; }
      .hostPost--lead .hostPost__title { font-size: 20px; }
      .hostPost--lead .hostPost__excerpt { -webkit-line-clamp: 4; font-size: 14px; }
    }
    .hostGrid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    @media (min-width: 768px) { .hostGrid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; } }
    @media (max-width: 767px) { .hostGrid .hostPost__excerpt { display: none; } }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const C = () => window.CardMock;
  const thumb = (p, deg = 160) => `background:linear-gradient(${deg}deg,hsl(${p.hue} 45% 28%),hsl(${p.hue + 30} 55% 55%))`;

  const homeCard = (p) => `
    <li class="hostCard"><a href="${p.slug}">
      <div class="hostCard__media" style="${thumb(p)}">
        <span class="hostHex"><span>${p.score.toFixed(1)}<small>${C().scoreRank(p.score)}</small></span></span>
        <span class="hostDots">${p.vods.map((v) => `<i style="background:${C().VOD_COLOR[v]}"></i>`).join('')}</span>
      </div>
      <div class="hostCard__title">${p.title}</div><div class="hostCard__cat">${p.category}</div>
    </a></li>`;

  const post = (p, lead) => `
    <${lead ? 'div' : 'li'} class="hostPost${lead ? ' hostPost--lead' : ''}"><a class="hostPost__link" href="${p.slug}">
      <div class="hostPost__media" style="${thumb(p, 135)}"></div>
      <div class="hostPost__body"><span class="hostPost__date">${p.date}</span><span class="hostPost__title">${p.title}</span><span class="hostPost__excerpt">${p.excerpt}</span></div>
    </a></${lead ? 'div' : 'li'}>`;

  const header = (nav) => `
    <header class="hostHeader"><span class="hostHeader__logo">KatsumaScore</span>
      <nav class="hostHeader__nav"><span>映画</span><span>アニメ</span><span>ドラマ</span><span>VOD</span>${nav || ''}</nav>
    </header>`;

  /** TOP：ヒーロー → [afterHero] → 最新レビュー → 高評価 */
  const top = (slots) => {
    const posts = C().POSTS;
    const high = [...posts].sort((a, b) => b.score - a.score);
    const hero = posts[3];
    return `
      <div class="hostTop">
        <section class="hostHero"><div class="hostHero__bg" style="${thumb(hero, 120)}"></div>
          <div class="hostHero__body"><span class="hostHero__eyebrow">PICK UP</span><h1 class="hostHero__title">${hero.title}</h1><p class="hostHero__lead">${hero.excerpt}</p></div>
        </section>
        ${slots.afterHero || ''}
        <section class="hostSection"><div class="hostSection__head"><h2 class="hostSection__title"><small>LATEST</small>最新レビュー</h2><span class="hostSection__more">すべて見る →</span></div>
          <ul class="hostScroll">${posts.map(homeCard).join('')}</ul></section>
        <section class="hostSection"><div class="hostSection__head"><h2 class="hostSection__title"><small>HIGH SCORE</small>高評価</h2><span class="hostSection__more">すべて見る →</span></div>
          <ul class="hostScroll">${high.map(homeCard).join('')}</ul></section>
      </div>`;
  };

  /** リスト：見出し → 絞り込み → [listTop] → リード記事 → グリッド */
  const list = (slots) => {
    const [lead, ...rest] = C().POSTS;
    return `
      <section class="hostList__hero"><p class="hostList__eyebrow">MOVIE</p><h1 class="hostList__h1">映画</h1><p class="hostList__desc">KatsumaScoreの映画レビュー一覧</p></section>
      <div class="hostFilter"><span>スコア順</span><span>新着順</span><span>配信中</span><span>ホラー</span><span>ドラマ</span><span>SF</span></div>
      <div class="hostList__body">
        ${slots.listTop || ''}
        ${post(lead, true)}
        <ol class="hostGrid">${rest.map((p) => post(p)).join('')}</ol>
      </div>`;
  };

  /** 土台を描く。view は 'top' | 'list' */
  const render = (root, { view, slots = {}, nav = '' }) => {
    root.classList.add('host');
    root.innerHTML = header(nav) + (view === 'list' ? list(slots) : top(slots));
  };

  /** モック用：URLの ?view= を読み、TOP／リストの切替バーを出す */
  const viewFromUrl = () => (new URLSearchParams(location.search).get('view') === 'list' ? 'list' : 'top');

  const mountSwitch = (view, onChange) => {
    if (new URLSearchParams(location.search).get('embed')) return null;
    const bar = document.createElement('div');
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'モック操作');
    bar.style.cssText = 'position:sticky;top:0;z-index:80;display:flex;gap:6px;align-items:center;padding:6px 16px;background:#fffbe6;border-bottom:1px dashed #b59f00;font:12px system-ui,sans-serif;color:#3b3200';
    bar.innerHTML = 'ページ：' + ['top', 'list'].map((v) => `<button type="button" data-v="${v}" aria-pressed="${v === view}" style="all:unset;cursor:pointer;padding:2px 10px;border-radius:999px;border:1px solid #b59f00;${v === view ? 'background:#3b3200;color:#fffbe6' : ''}">${v === 'top' ? 'TOP' : 'リスト（映画）'}</button>`).join('');
    bar.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => onChange(b.dataset.v)));
    document.body.prepend(bar);
    return bar;
  };

  window.SayoHost = { render, viewFromUrl, mountSwitch, thumb };
})();
