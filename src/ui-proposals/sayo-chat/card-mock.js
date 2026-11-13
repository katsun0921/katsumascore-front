/*
 * 案D・案E（Postカードからサヨに要約してもらう）共通スクリプト（ui-proposals専用）
 *
 * 前提：TOPページとリストページのPostカードに「サヨの要約」ボタンを置く。
 *
 * 要約の出どころ（提案）：
 *   ai-chat の索引構築が記事ごとに作り、人が確認して承認した
 *   summarySafe（ネタバレなし要約・300字以内）・moodTags（気分タグ）・recommendFor（向いている人）
 *   をそのまま返す。LLMを呼ばないので、即時・費用0・回数を消費しない。
 *   → ai-chat に記事IDで要約を返すAPIの追加が必要（下の fetchSummary が想定する形）。
 *
 *     GET /api/chat/articles/{id}/summary
 *     → { status: "ok", articleId, avatarId: "sayo", lead, summary, moodTags, recommendFor, article: ArticleCard }
 *
 *   「もっと聞く」から先は従来の /api/chat/message（LLM・回数を消費）。
 *   記事を指定して聞けるよう、MessageRequest に articleId を足す案も合わせて検討する。
 *
 * 作品名・本文・スコアはすべて架空。
 */
(() => {
  const POSTS = [
    {
      id: 1201, slug: '#', title: '霧の灯台守', category: '映画', score: 4.2, vods: ['unext', 'netflix'], hue: 205,
      date: '2026.10.20', excerpt: '孤島の灯台で働く男の日常が、少しずつ霧に侵食されていく。派手な驚かしに頼らない、静かなホラー。',
      summary: '孤島の灯台を一人で守る男が、毎晩少しずつ濃くなる霧と、霧の向こうから届く信号に悩まされる物語です。記事では、波の音が途切れる瞬間の「無音」の使い方を高く評価していて、驚かせる場面はほとんどないのに、画面の暗がりを自分から探してしまう怖さがあると書かれています。',
      moodTags: ['じわじわ怖い', '静か', '雰囲気重視'], recommendFor: '大きな音で驚かされるのは苦手だけど、ホラーの空気は味わいたい人に',
      vodLabel: 'U-NEXT / Netflix', vodCheckedAt: '2026/10/22',
    },
    {
      id: 1202, slug: '#', title: '真夜中の映写室', category: '映画', score: 3.8, vods: ['prime'], hue: 280,
      date: '2026.10.17', excerpt: '閉館の決まった名画座で、最後の夜に起きた出来事。映写機の音が主役の群像劇。',
      summary: '閉館が決まった名画座の最後の一夜を、映写技師・常連客・アルバイトの三人の視点で描く群像劇です。記事では、実際に動く古い映写機を修理して撮影に使ったことに触れ、フィルムの回る音が登場人物の気持ちの揺れと重なる演出を見どころに挙げています。一方で、中盤の回想がやや長いという指摘もあります。',
      moodTags: ['しみじみ', '映画好き向け'], recommendFor: '映画館という場所そのものが好きな人、撮影の工夫に目が行く人に',
      vodLabel: 'Prime Video', vodCheckedAt: '2026/10/18',
    },
    {
      id: 1203, slug: '#', title: '提灯坂の怪談帖', category: 'アニメ', score: 4.5, vods: ['danime', 'unext'], hue: 25,
      date: '2026.10.12', excerpt: '坂の途中の古本屋に持ち込まれる、いわくつきの本。一話完結の怪談アニメ。',
      summary: '坂の途中にある古本屋に、毎回いわくつきの本が持ち込まれる一話完結の怪談アニメです。記事では、背景美術の提灯の明かりが話ごとに色を変え、その回の怖さの種類を先に知らせている工夫を紹介しています。怖さは控えめで、後味が切ない回が多いとまとめられています。',
      moodTags: ['ちょっと怖い', '切ない', '一話完結'], recommendFor: '寝る前に一話ずつ、少しだけ怖い話を観たい人に',
      vodLabel: 'dアニメストア / U-NEXT', vodCheckedAt: '2026/10/20',
    },
    {
      id: 1204, slug: '#', title: 'さよならの温度', category: '映画', score: 4.6, vods: ['netflix'], hue: 340,
      date: '2026.10.05', excerpt: '文通だけでつながる二人の十年。手紙の文字が画面を語る恋愛映画。',
      summary: '一度しか会ったことのない二人が、手紙だけで十年をつないでいく恋愛映画です。記事では、手紙の文字をそのまま画面に映す演出によって、声に出されない気持ちが観客にだけ届く構成を評価しています。派手な事件は起きませんが、季節の移り変わりと筆跡の変化で時間の重みを感じさせる作品だと書かれています。',
      moodTags: ['泣ける', '静か', '大人向け'], recommendFor: 'ゆっくり進む物語で、余韻に浸りたい人に',
      vodLabel: 'Netflix', vodCheckedAt: '2026/10/21',
    },
    {
      id: 1205, slug: '#', title: '鋼鉄のパレード', category: '映画', score: 3.4, vods: ['disney', 'prime'], hue: 140,
      date: '2026.09.28', excerpt: '巨大ロボットが街を練り歩く祭りの裏で、整備士たちの一夜の奮闘。',
      summary: '年に一度、巨大ロボットが街を練り歩く祭りの前夜、動かなくなった一体を直そうとする整備士たちの奮闘を描きます。記事では、模型と実物大の造形を組み合わせたロボットの質感を高く評価する一方、人物の掘り下げが浅く、終盤が駆け足になっている点を惜しいとしています。',
      moodTags: ['ワクワク', '家族向け'], recommendFor: 'メカの造形や特撮の手触りを楽しみたい人に',
      vodLabel: 'Disney+ / Prime Video', vodCheckedAt: '2026/10/01',
    },
    {
      id: 1206, slug: '#', title: '星屑ランドリー', category: 'ドラマ', score: 4.0, vods: ['hulu'], hue: 250,
      date: '2026.09.21', excerpt: '深夜のコインランドリーに集まる人々の、洗濯が終わるまでの40分。',
      summary: '深夜営業のコインランドリーを舞台に、洗濯が終わるまでの40分だけ言葉を交わす人々を描く連続ドラマです。記事では、各話がほぼ実時間で進む構成と、乾燥機の回る音を会話の間として使う演出を見どころに挙げています。後半の数話は登場人物がつながっていき、全体で一つの物語になると書かれています。',
      moodTags: ['ほっこり', '会話劇'], recommendFor: '短い時間で少しずつ観られる、会話の面白い作品を探している人に',
      vodLabel: 'Hulu', vodCheckedAt: '2026/09/30',
    },
  ];

  /** VODの色はサイトのトークン（globals.css の --color-*）を参照する */
  const VOD_COLOR = {
    unext: 'var(--color-unext)', netflix: 'var(--color-netflix)', prime: 'var(--color-amazon)',
    danime: 'var(--color-dmmtv)', disney: 'var(--color-disney)', hulu: 'var(--color-hulu)',
  };

  const scoreRank = (s) => {
    if (s >= 4.5) return 'SS';
    if (s >= 4) return 'S';
    if (s >= 3) return 'A';
    return 'B';
  };

  /** 想定API GET /api/chat/articles/{id}/summary のモック。承認済み要約なので即時に返る */
  const fetchSummary = (id) => new Promise((resolve) => {
    const p = POSTS.find((x) => x.id === Number(id));
    setTimeout(() => {
      if (!p) { resolve({ status: 'not_found' }); return; }
      resolve({
        status: 'ok', articleId: p.id, avatarId: 'sayo',
        lead: `『${p.title}』は、こんな作品です。`,
        summary: p.summary, moodTags: p.moodTags, recommendFor: p.recommendFor,
        article: { id: p.id, title: p.title, url: p.slug, category: p.category, katsumaScore: p.score, vod: p.vodLabel.split(' / '), vodCheckedAt: p.vodCheckedAt },
      });
    }, 350);
  });

  /** 「もっと聞く」の候補（記事を指定した質問） */
  const followUps = (p) => [
    `『${p.title}』の見どころをもう少し`,
    `『${p.title}』に似た作品は？`,
    `『${p.title}』の惜しいところは？`,
  ];

  /** 「もっと聞く」への架空の返事（本番は /api/chat/message、回数を1消費） */
  const followUpReply = (p, q) => {
    if (q.includes('似た')) return { reply: `似た空気の作品でしたら、記事のある中では『${POSTS[(POSTS.indexOf(p) + 2) % POSTS.length].title}』が近いと思います。どちらも、音の使い方で気持ちを運ぶタイプの作品なんです。`, articles: [POSTS[(POSTS.indexOf(p) + 2) % POSTS.length]] };
    if (/結末|ネタバレ/.test(q)) return { reply: '【ネタバレあり】……では、結末に触れますね。記事では、最後の場面で主人公が選んだ道を「静かな決着」と評しています。どこまで話してよいかは、サーバーがネタバレの許可を判断したうえでお答えします。', articles: [] };
    if (q.includes('惜しい')) return { reply: '記事では、テンポがゆっくりな分、合わない人には中盤が長く感じられるかもしれない、と書かれています。私は、その「間」こそがこの作品らしさだとも思うのですが……好みが分かれるところですね。', articles: [] };
    return { reply: `あっ、それなら……記事でいちばん熱を込めて書かれているのは、${p.moodTags[0]}空気を作る演出の部分です。${p.recommendFor.replace(/に$/, '')}には、きっと刺さると思います。`, articles: [] };
  };

  /*
   * パターン1「おすすめを探す（検索）」
   *   - 候補ボタン（chips）：承認済み要約の moodTags（気分タグ）で絞り込む。LLMを使わない＝即時・費用0・回数を減らさない。
   *     → ai-chat に「気分タグ・カテゴリで記事を返すAPI」の追加が必要（facets.json の moodTags が元データ）。
   *   - 自由入力：従来の /api/chat/message（LLM＋ベクトル検索、回数を1消費）。
   *   - リストページでは、そのカテゴリ（例：映画）の中だけで探す。
   */
  const SEARCH_CHIPS = [
    { label: '怖すぎないホラー', tags: ['じわじわ怖い', 'ちょっと怖い'], reply: '怖すぎないホラーでしたら、こちらはいかがでしょう。大きな音で驚かせるより、空気でじわじわ来るタイプです。' },
    { label: '泣ける作品', tags: ['泣ける', '切ない'], reply: '泣ける作品なら、こちらを。どれも観たあとに余韻が長く残るタイプです。' },
    { label: '少しずつ観たい', tags: ['一話完結', '会話劇'], reply: '短い時間で区切って観られる作品を選びました。寝る前の一話にも向いています。' },
    { label: 'ワクワクしたい', tags: ['ワクワク', '家族向け'], reply: 'ワクワクしたい日には、こちらはいかがでしょう。' },
  ];

  /** 自由入力の架空の検索（本番はLLM＋ベクトル検索） */
  const FREE_WORDS = [
    { re: /ホラー|怖/, ids: [1201, 1203] },
    { re: /泣|恋愛|手紙|切な/, ids: [1204] },
    { re: /アニメ/, ids: [1203] },
    { re: /ドラマ|短い|会話/, ids: [1206] },
    { re: /ロボ|特撮|メカ/, ids: [1205] },
    { re: /映画館|名画座|撮影/, ids: [1202] },
  ];

  const NO_MATCH = 'ごめんなさい、今ある記事からは、ぴったりの作品が見つかりませんでした。気分やジャンルを、別の言い方で教えていただけますか？';

  /**
   * パターン1のモック。scope はカテゴリ名（リストページ）か null（TOP）。
   * 戻り値の source：'tags'＝候補ボタン（回数を減らさない）／'llm'＝自由入力（回数を1消費）
   */
  const search = (q, scope) => new Promise((resolve) => {
    const pool = scope ? POSTS.filter((p) => p.category === scope) : POSTS;
    const chip = SEARCH_CHIPS.find((c) => c.label === q);
    if (chip) {
      const posts = pool.filter((p) => p.moodTags.some((t) => chip.tags.includes(t))).slice(0, 3);
      setTimeout(() => resolve({ source: 'tags', reply: posts.length ? chip.reply : NO_MATCH, posts }), 300);
      return;
    }
    const ids = [...new Set(FREE_WORDS.filter((w) => w.re.test(q)).flatMap((w) => w.ids))];
    const posts = pool.filter((p) => ids.includes(p.id)).slice(0, 3);
    const reply = posts.length ? `「${q}」でしたら、記事の中からこちらを選びました。気になる作品があれば、要約もお話しできますよ。` : NO_MATCH;
    setTimeout(() => resolve({ source: 'llm', reply, posts }), 1400);
  });

  window.CardMock = { POSTS, VOD_COLOR, scoreRank, fetchSummary, followUps, followUpReply, SEARCH_CHIPS, search };
})();
