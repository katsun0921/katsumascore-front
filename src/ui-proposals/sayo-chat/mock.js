/*
 * サヨ会話UIモック共通スクリプト（ui-proposals専用・本番コードではない）
 *
 * katsumascore-ai-chat の公開API（schema/api.schema.json）と同じ形の応答を、
 * 通信せずに返す。各案のHTMLはこの応答を描画するだけにして、案ごとの違いを
 * 「見せ方」だけに絞る。
 *
 * - 作品名・スコア・配信先はすべて架空。実在作品と混同しないため。
 * - 表情はAPIが返さないため、フロントで status から決める想定（expressionFor）。
 * - 立ち絵は仮画像1枚を5表情に流用している（ai-chat側と同じ状態）。
 */
(() => {
  const IMG = {
    full: 'img/sayo-full.webp',
    face: 'img/sayo-face.webp',
  };

  /** GET /api/chat/avatars の1件に相当 */
  const avatar = {
    id: 'sayo',
    name: 'サヨ',
    label: 'AI映画店主',
    intro: '気分や好みを伺って、KatsumaScoreの記事から作品をご案内します。',
    images: {
      default: IMG.face,
      thinking: IMG.face,
      recommend: IMG.face,
      sorry: IMG.face,
      secret: IMG.face,
    },
  };

  const EXPRESSION_LABEL = {
    default: 'default（通常）',
    thinking: 'thinking（考え中）',
    recommend: 'recommend（おすすめ）',
    sorry: 'sorry（ごめんなさい）',
    secret: 'secret（ネタバレ注意）',
  };

  /** 架空の記事カード（ArticleCard と同じ項目） */
  const ARTICLES = {
    lighthouse: {
      id: 1201, title: '霧の灯台守', category: '映画', katsumaScore: 4.2,
      vod: ['U-NEXT', 'Netflix'], vodCheckedAt: '2026/10/22', url: '#', hue: 205,
    },
    projection: {
      id: 1202, title: '真夜中の映写室', category: '映画', katsumaScore: 3.8,
      vod: ['Prime Video'], vodCheckedAt: '2026/10/18', url: '#', hue: 280,
    },
    lantern: {
      id: 1203, title: '提灯坂の怪談帖', category: 'アニメ', katsumaScore: 4.5,
      vod: ['dアニメストア', 'U-NEXT'], vodCheckedAt: '2026/10/20', url: '#', hue: 25,
    },
    temperature: {
      id: 1204, title: 'さよならの温度', category: '映画', katsumaScore: 4.6,
      vod: ['Netflix'], vodCheckedAt: '2026/10/21', url: '#', hue: 340,
    },
  };

  /** 入力から架空の応答を選ぶ（本番はサーバーが検索・生成する） */
  const SCENARIOS = [
    {
      match: /ネタバレ|結末|ラスト/,
      response: {
        status: 'ok', spoiler: true, articles: [ARTICLES.temperature], suggestAvatar: null,
        reply: '……では、結末に触れますね。記事では、最後に主人公が手紙を読まずに燃やす場面を「言葉にしない別れ」と評しています。私は、あの場面で音楽が止まる演出が、彼女の決意をいちばん雄弁に語っていると思うんです。',
      },
    },
    {
      match: /裏話|制作|撮影|メイキング|特殊メイク|美術/,
      response: {
        status: 'ok', spoiler: false, articles: [ARTICLES.projection], suggestAvatar: null,
        reply: 'あっ、その話は好きです。記事によると『真夜中の映写室』の映写機は実際に動く古い機械を修理して使ったそうで、フィルムが切れる場面も本物の音なんです。だから画面のちらつきに、作り物らしさがないんですね。……ふふ、話が長くなりましたね。',
      },
    },
    {
      match: /ホラー|怖/,
      response: {
        status: 'ok', spoiler: false, articles: [ARTICLES.lighthouse, ARTICLES.lantern], suggestAvatar: null,
        reply: '怖すぎないホラーでしたら、この2本はいかがでしょう。『霧の灯台守』は驚かせるより静かな不安で引っ張る作品で、記事でも「夜に観ても眠れる怖さ」と書かれています。アニメの『提灯坂の怪談帖』は一話完結なので、少しずつ試せますよ。',
      },
    },
    {
      match: /泣|感動|切な/,
      response: {
        status: 'ok', spoiler: false, articles: [ARTICLES.temperature], suggestAvatar: null,
        reply: '泣ける作品なら『さよならの温度』をおすすめします。記事のスコアは4.6で、手紙のやりとりだけで二人の距離を描く脚本が高く評価されています。結末まで知りたい場合は、ネタバレありでお話しすることもできます。',
      },
    },
    {
      match: /AI|人間|あなたは/,
      response: {
        status: 'ok', spoiler: false, articles: [], suggestAvatar: null,
        reply: '私は、KatsumaScoreの記事をもとに映画をご案内するAIです。お店は演出なので、実際にDVDを手に取ることはできないんです。そのぶん、記事の中から一本ずつ丁寧に探しますね。',
      },
    },
  ];

  const NO_MATCH = 'ごめんなさい、今あるKatsumaScoreの記事からは、ぴったりの作品が見つかりませんでした。気分やジャンル、気になっている作品名など、別の言い方で教えていただけますか？';

  /** 強制できる失敗系（デバッグパネルから選ぶ） */
  const FORCED = {
    no_match: { http: 200, label: '該当なし（no_match）' },
    limit_user: { http: 429, label: '本日の上限（limit_user）' },
    limit_global: { http: 429, label: 'サイト全体の上限（limit_global）' },
    session_expired: { http: 401, label: 'セッション切れ（session_expired）' },
    disabled: { http: 503, label: '受付停止（disabled）' },
    error: { http: 502, label: '通信エラー（error）' },
  };

  const state = {
    remaining: 30,
    forced: null,
    delayMs: 1400,
  };

  const timeGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return 'おはようございます';
    if (h >= 11 && h < 18) return 'こんにちは';
    return 'こんばんは';
  };

  /** POST /api/chat/session の greetings.sayo に相当 */
  const greeting = () => `${timeGreeting()}、サヨです。今日はどんな映画が気になっていますか？`;

  const base = (status, extra = {}) => ({
    status, avatarId: 'sayo', reply: '', articles: [], suggestAvatar: null,
    spoiler: false, remaining: state.remaining, ...extra,
  });

  /** POST /api/chat/message に相当。{http, body} を返す */
  const send = (message) => new Promise((resolve) => {
    const forced = state.forced;
    state.forced = null;
    setTimeout(() => {
      if (message.length > 200) {
        resolve({ http: 400, body: base('too_long') });
        return;
      }
      if (forced && forced !== 'no_match') {
        const remaining = forced === 'limit_user' ? 0 : state.remaining;
        state.remaining = remaining;
        resolve({ http: FORCED[forced].http, body: base(forced, { remaining }) });
        return;
      }
      if (state.remaining <= 0) {
        resolve({ http: 429, body: base('limit_user', { remaining: 0 }) });
        return;
      }
      const hit = forced ? null : SCENARIOS.find((s) => s.match.test(message));
      state.remaining -= 1;
      if (!hit) {
        resolve({ http: 200, body: base('no_match', { reply: NO_MATCH }) });
        return;
      }
      resolve({ http: 200, body: base('ok', { ...hit.response }) });
    }, state.delayMs);
  });

  /** 応答から立ち絵の表情を決める（フロント側の対応付け案） */
  const expressionFor = (body) => {
    if (body.status !== 'ok') return 'sorry';
    if (body.spoiler) return 'secret';
    if (body.articles.length > 0) return 'recommend';
    return 'default';
  };

  /** status ごとの画面表示文（フロントのi18nに置く想定） */
  const STATUS_MESSAGE = {
    too_long: { title: '200文字までで入力してください', action: null },
    limit_user: { title: '今日の会話回数の上限に達しました', body: '明日（日本時間0時）にまたお話しできます。', action: null },
    limit_global: { title: '今日はたくさんのお客さんが来てくれました', body: 'サイト全体の上限に達したため、本日の受付を終了しました。', action: null },
    session_expired: { title: 'セッションの有効期限が切れました', body: 'もう一度入店すると、会話を続けられます。', action: '入り直す' },
    disabled: { title: 'ただいま準備中です', body: 'しばらくしてから、もう一度お越しください。', action: null },
    error: { title: '返事を受け取れませんでした', body: '少し時間をおいて、もう一度送ってください。', action: 'もう一度送る' },
  };

  const QUICK_REPLIES = [
    '怖すぎないホラーが観たい',
    '泣ける映画を教えて',
    '撮影の裏話が知りたい',
    'さよならの温度のネタバレを教えて',
  ];

  const DISCLAIMER = 'AIの回答です。内容はKatsumaScoreの記事に基づきます。個人情報は入力しないでください。';

  const scoreRank = (score) => {
    if (score >= 4.5) return 'SS';
    if (score >= 4) return 'S';
    if (score >= 3) return 'A';
    return 'B';
  };

  /**
   * モック専用：状態を強制するパネル。本番には含めない。
   * onChange は強制状態を選んだときに呼ぶ（任意）。
   */
  const mountDebug = (opts = {}) => {
    const box = document.createElement('details');
    box.className = 'mockDebug';
    box.innerHTML = `
      <summary>モック操作</summary>
      <p>次の送信の結果を選ぶ</p>
      <div class="mockDebug__list">
        <button type="button" data-forced="">通常（入力で応答を選ぶ）</button>
        ${Object.entries(FORCED).map(([k, v]) => `<button type="button" data-forced="${k}">${v.label}</button>`).join('')}
      </div>
      <label class="mockDebug__row">応答の待ち時間
        <select data-delay>
          <option value="600">0.6秒</option>
          <option value="1400" selected>1.4秒</option>
          <option value="4000">4秒</option>
        </select>
      </label>
      <p class="mockDebug__now">現在：<span data-now>通常</span></p>`;
    const style = document.createElement('style');
    style.textContent = `
      .mockDebug{position:fixed;left:12px;bottom:12px;z-index:9999;max-width:260px;font:12px/1.5 system-ui,sans-serif;
        background:#fffbe6;color:#3b3200;border:1px dashed #b59f00;border-radius:8px;padding:6px 10px;box-shadow:0 4px 16px rgba(0,0,0,.2)}
      .mockDebug summary{cursor:pointer;font-weight:700}
      .mockDebug p{margin:6px 0 4px}
      .mockDebug__list{display:flex;flex-direction:column;gap:4px}
      .mockDebug button{all:unset;cursor:pointer;padding:3px 6px;border-radius:4px;background:#fff3b0}
      .mockDebug button:hover,.mockDebug button:focus-visible{background:#ffe066;outline:2px solid #b59f00}
      .mockDebug__row{display:flex;gap:6px;align-items:center;margin-top:6px}
      .mockDebug__now span{font-weight:700}
      ${opts.position === 'right' ? '.mockDebug{left:auto;right:12px;top:12px;bottom:auto}' : ''}
      ${opts.position === 'left-top' ? '.mockDebug{top:56px;bottom:auto}' : ''}`;
    document.head.appendChild(style);
    document.body.appendChild(box);
    const now = box.querySelector('[data-now]');
    box.querySelectorAll('[data-forced]').forEach((b) => {
      b.addEventListener('click', () => {
        state.forced = b.dataset.forced || null;
        now.textContent = state.forced ? FORCED[state.forced].label : '通常';
        if (opts.onChange) opts.onChange(state.forced);
      });
    });
    box.querySelector('[data-delay]').addEventListener('change', (e) => {
      state.delayMs = Number(e.target.value);
    });
    const origSend = send;
    window.SayoMock.send = (m) => origSend(m).then((r) => {
      now.textContent = '通常';
      return r;
    });
  };

  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  window.SayoMock = {
    IMG, avatar, greeting, send, expressionFor, EXPRESSION_LABEL, STATUS_MESSAGE,
    QUICK_REPLIES, DISCLAIMER, scoreRank, mountDebug, escapeHtml, state,
    maxChars: 200,
  };
})();
