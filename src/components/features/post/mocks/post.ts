import type { Post, PostContentData } from '@/components/features/post/types/post';

export const mockPost: Post = {
  id: 'post-001',
  slug: '/posts/hanataba-review',
  title: '映画『花束みたいな恋をした』の余韻を静かにほどくレビュー',
  excerpt:
    '登場人物の距離感や東京の空気を追いながら、恋愛映画としての切なさと現代性を丁寧に読み解くためのレビューです。',
  image: '/images/mock-image.webp',
  publishedAt: '2026-04-01',
  category: '映画',
  score: 4.5,
};

export const mockPostLongTitle: Post = {
  ...mockPost,
  id: 'post-002',
  slug: '/posts/gquuuuuux-deep-dive',
  title:
    '劇場版『機動戦士ガンダム ジークアクス』はなぜここまで観客の感情を揺さぶるのかを、演出と脚本と音響設計の積み重ねからじっくり読み解いてみる',
  publishedAt: '2026-04-02',
};

export const mockPostNoImage: Post = {
  ...mockPost,
  id: 'post-003',
  slug: '/posts/spring-drama-first-look',
  title: '春ドラマ序盤レビュー 今年の注目作を3本に絞って比較する',
  image: null,
  publishedAt: '2026-04-03',
};

export const mockPosts: Post[] = [
  mockPost,
  mockPostLongTitle,
  mockPostNoImage,
  {
    ...mockPost,
    id: 'post-004',
    slug: '/posts/frieren-quiet-power',
    title: 'アニメ『葬送のフリーレン』の静かな強さ',
    publishedAt: '2026-04-04',
    score: 5,
    category: 'アニメ',
  },
];

export const mockPostContent: PostContentData = {
  content: `
    <h2>WordPress 記事本文のサンプル</h2>
    <p>これは WordPress 由来の HTML コンテンツを確認するためのサンプルです。</p>
    <p><strong>強調テキスト</strong>や<a href="https://example.com">リンク</a>の見え方も確認できます。</p>
    <blockquote>
      <p>引用ブロックの余白やタイポグラフィも Storybook 上で確認できます。</p>
    </blockquote>
  `,
};

// ─────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────
export const mockPostContentTypography: PostContentData = {
  content: `
    <h1>h1 見出し：映画レビューのタイトル</h1>
    <p>h1直後の段落。余白・下線装飾を確認します。</p>

    <h2>h2 見出し：グラデーション背景</h2>
    <p>h2の背景グラデーションとボーダーを確認します。</p>

    <h3>h3 見出し：アニメーション下線と頭文字装飾</h3>
    <p>h3のアニメーション下線と最初の文字のグラデーションを確認します。</p>

    <h4>h4 見出し：レイヤーハイライト背景</h4>
    <p>h4の半透明ハイライトを確認します。</p>

    <h5>h5 見出し：左ボーダーアクセント</h5>
    <p>h5の左ボーダーを確認します。</p>

    <h6>h6 見出し：最小レベル</h6>
    <p>h6のスタイルを確認します。</p>

    <h2>テキスト装飾</h2>
    <p>
      <strong>strong 強調</strong>、
      <b>b 太字</b>、
      <em>em 斜体</em>、
      <i>i イタリック</i>、
      <u>u 下線</u>、
      <s>s 打ち消し線</s>、
      <del>del 削除テキスト</del>、
      <mark>mark ハイライト</mark>、
      <ins>ins 挿入テキスト</ins>、
      <small>small 小テキスト</small>、
      <abbr title="HyperText Markup Language">abbr（HTML）</abbr>
    </p>

    <h2>引用（blockquote）</h2>
    <blockquote>
      <p>映画とは、光と影で編まれた夢である。スクリーンの前に座るとき、私たちは別の人生を生きる。</p>
      <cite>映画評論家 山田太郎</cite>
    </blockquote>

    <h2>段落の連続と余白確認</h2>
    <p>1つ目の段落。下余白が適切に空いているか確認します。</p>
    <p>2つ目の段落。前後の段落との間隔を確認します。</p>
    <p>3つ目の段落。最後の段落にはmargin-bottomがつかないことを確認します。</p>
  `,
};

// ─────────────────────────────────────────────
// Links
// ─────────────────────────────────────────────
export const mockPostContentLinks: PostContentData = {
  content: `
    <h2>リンクのスタイル確認</h2>
    <p>
      通常の<a href="https://example.com">テキストリンク</a>のスタイルを確認します。
      ホバー時に背景色・ボーダーが変化します。
    </p>
    <p>
      <a href="https://example.com">リンクが文中に複数</a>ある場合の
      <a href="https://example.com">折り返しと余白</a>の挙動を確認します。
    </p>
    <p>
      長いURLのテキストリンク：
      <a href="https://example.com">https://very-long-url-that-might-cause-overflow.example.com/path/to/article</a>
    </p>
    <p>
      strongの中のリンク：<strong><a href="https://example.com">強調リンク</a></strong>
    </p>
  `,
};

// ─────────────────────────────────────────────
// Lists
// ─────────────────────────────────────────────
export const mockPostContentLists: PostContentData = {
  content: `
    <h2>リスト確認</h2>

    <h3>ul（unordered list）</h3>
    <ul>
      <li>アイテム 1</li>
      <li>アイテム 2
        <ul>
          <li>ネスト 2-1</li>
          <li>ネスト 2-2
            <ul>
              <li>深いネスト 3-1</li>
              <li>深いネスト 3-2</li>
            </ul>
          </li>
        </ul>
      </li>
      <li>アイテム 3</li>
    </ul>

    <h3>ol（ordered list）</h3>
    <ol>
      <li>手順 1：最初のステップ</li>
      <li>手順 2：次のステップ
        <ol>
          <li>サブ手順 2-1</li>
          <li>サブ手順 2-2
            <ol>
              <li>deeper 2-2-1</li>
            </ol>
          </li>
        </ol>
      </li>
      <li>手順 3：最終ステップ</li>
    </ol>

    <h3>Gutenberg: wp-block-list</h3>
    <ul class="wp-block-list">
      <li>Gutenbergリストアイテム 1</li>
      <li>Gutenbergリストアイテム 2</li>
      <li>Gutenbergリストアイテム 3</li>
    </ul>

    <h3>details / summary（折りたたみ）</h3>
    <details>
      <summary>クリックして展開する</summary>
      <p>折りたたみコンテンツの内容です。Gutenbergのdetailsブロックに対応しています。</p>
      <ul>
        <li>折りたたみ内のリスト 1</li>
        <li>折りたたみ内のリスト 2</li>
      </ul>
    </details>
  `,
};

// ─────────────────────────────────────────────
// Media
// ─────────────────────────────────────────────
export const mockPostContentMedia: PostContentData = {
  content: `
    <h2>画像</h2>
    <img src="/images/mock-image.webp" alt="サンプル画像" />

    <h2>Gutenberg: wp-block-image</h2>
    <figure class="wp-block-image">
      <img src="/images/mock-image.webp" alt="Gutenbergイメージブロック" />
      <figcaption class="wp-element-caption">図：Gutenbergイメージブロックのキャプション</figcaption>
    </figure>

    <h2>WordPress: wp-caption</h2>
    <div class="wp-caption">
      <img src="/images/mock-image.webp" alt="wp-captionサンプル" />
      <p class="wp-caption-text">wp-captionのキャプションテキストです。</p>
    </div>

    <h2>align クラス確認</h2>
    <img src="/images/mock-image.webp" alt="aligncenter" class="aligncenter" style="width:300px" />
    <p>aligncenterで中央寄せされた画像の後ろの段落です。</p>

    <h2>インラインサイズ指定（外部HTML対策）</h2>
    <p>widthやheight属性が付いていてもmax-width:100%で制御されることを確認します。</p>
    <img src="/images/mock-image.webp" alt="インラインサイズ" width="9999" height="300" />

    <h2>YouTube embed（16:9）</h2>
    <figure class="wp-block-embed is-type-video wp-embed-aspect-16-9">
      <div class="wp-block-embed__wrapper">
        <iframe
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="YouTube動画"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </figure>
  `,
};

// ─────────────────────────────────────────────
// Gutenberg Blocks
// ─────────────────────────────────────────────
export const mockPostContentGutenberg: PostContentData = {
  content: `
    <h2>Pullquote</h2>
    <figure class="wp-block-pullquote">
      <blockquote>
        <p>映画は人生の縮図である。スクリーンの中に、私たちは自分自身を見る。</p>
      </blockquote>
      <cite>匿名</cite>
    </figure>

    <h2>Button</h2>
    <div class="wp-block-buttons">
      <div class="wp-block-button">
        <a class="wp-block-button__link" href="https://example.com">通常ボタン</a>
      </div>
      <div class="wp-block-button is-style-outline">
        <a class="wp-block-button__link" href="https://example.com">アウトラインボタン</a>
      </div>
    </div>

    <h2>Columns</h2>
    <div class="wp-block-columns">
      <div class="wp-block-column">
        <p>左カラムのコンテンツです。テキストが入ります。</p>
      </div>
      <div class="wp-block-column">
        <p>右カラムのコンテンツです。テキストが入ります。</p>
      </div>
    </div>

    <h2>Separator</h2>
    <hr class="wp-block-separator" />
    <p>通常セパレーターの後</p>

    <hr class="wp-block-separator is-style-wide" />
    <p>Wideセパレーターの後</p>

    <hr class="wp-block-separator is-style-dots" />
    <p>Dotsセパレーターの後</p>

    <h2>Notice</h2>
    <div class="notice">
      <p>これはNotice（お知らせ）ブロックです。左ボーダーと薄い背景色で強調されます。</p>
    </div>
  `,
};

// ─────────────────────────────────────────────
// Table
// ─────────────────────────────────────────────
export const mockPostContentTable: PostContentData = {
  content: `
    <h2>Gutenberg: wp-block-table（横スクロール）</h2>
    <figure class="wp-block-table">
      <table>
        <thead>
          <tr>
            <th>作品名</th>
            <th>ジャンル</th>
            <th>公開年</th>
            <th>スコア</th>
            <th>おすすめ度</th>
            <th>視聴プラットフォーム</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>花束みたいな恋をした</td>
            <td>恋愛映画</td>
            <td>2021年</td>
            <td>4.5 / 5.0</td>
            <td>★★★★☆</td>
            <td>Amazon Prime Video</td>
          </tr>
          <tr>
            <td>葬送のフリーレン</td>
            <td>ファンタジーアニメ</td>
            <td>2023年</td>
            <td>5.0 / 5.0</td>
            <td>★★★★★</td>
            <td>Netflix / dアニメ</td>
          </tr>
          <tr>
            <td>機動戦士ガンダム ジークアクス</td>
            <td>SFアニメ</td>
            <td>2025年</td>
            <td>4.0 / 5.0</td>
            <td>★★★★☆</td>
            <td>劇場公開中</td>
          </tr>
        </tbody>
      </table>
    </figure>

    <h2>テーブル内に画像・divがネストされる場合</h2>
    <figure class="wp-block-table">
      <table>
        <thead>
          <tr><th>画像</th><th>説明</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><img src="/images/mock-image.webp" alt="テーブル内画像" style="width:200px" /></td>
            <td><div>テーブル内のdiv要素。<br />画像もdivもはみ出さないことを確認します。</div></td>
          </tr>
        </tbody>
      </table>
    </figure>
  `,
};

// ─────────────────────────────────────────────
// Code
// ─────────────────────────────────────────────
export const mockPostContentCode: PostContentData = {
  content: `
    <h2>インラインコード</h2>
    <p>本文中に <code>const x = 1;</code> のようなコードを埋め込めます。</p>
    <p>長いインラインコード: <code>const veryLongVariableName = someFunction(argument1, argument2, argument3);</code></p>

    <h2>コードブロック（preformatted）</h2>
    <pre><code>// JavaScriptのサンプルコード
function fetchPost(id: string): Promise&lt;Post&gt; {
  return fetch(\`/api/posts/\${id}\`)
    .then(res =&gt; res.json())
    .then(data =&gt; normalizePost(data));
}</code></pre>

    <h2>wp-block-preformatted</h2>
    <pre class="wp-block-preformatted">プリフォーマットテキスト
  インデントも    保持されます
  改行も保持されます</pre>
  `,
};

// ─────────────────────────────────────────────
// Defensive（防御的CSS確認）
// ─────────────────────────────────────────────
export const mockPostContentDefensive: PostContentData = {
  content: `
    <h2>防御的CSS確認</h2>

    <h3>長いURL・単語の折り返し</h3>
    <p>長いURLが含まれる段落: https://very-long-url-that-should-wrap-correctly-without-breaking-layout.example.com/path/to/some/deep/article?query=test&amp;another=value</p>
    <li>リスト内の長い単語: supercalifragilisticexpialidocioussupercalifragilisticexpialidocious</li>

    <h3>インラインスタイルの上書き確認</h3>
    <p>以下の画像はwidth="9999"が指定されていますが、max-width:100%で制御されます。</p>
    <img src="/images/mock-image.webp" alt="オーバーサイズ画像" width="9999" />

    <p>以下のiframeも同様に制御されます。</p>
    <iframe src="https://example.com" width="9999" height="400" title="オーバーサイズiframe"></iframe>

    <h3>空要素（display:noneになる）</h3>
    <p></p>
    <p>上の空のpタグは非表示になります（この段落が連続して見えるはず）。</p>

    <h3>float のクリア確認</h3>
    <img src="/images/mock-image.webp" alt="左寄せ画像" class="alignleft" style="width:200px" />
    <p>左に寄せられた画像の隣にテキストが流れます。floatのクリアにより、次のブロックが正しくリセットされることを確認します。</p>
    <p>この段落はfloatの影響を受けないはずです。</p>
  `,
};

// ─────────────────────────────────────────────
// 全セクション統合（All-in-one）
// ─────────────────────────────────────────────
export const mockPostContentFull: PostContentData = {
  content: [
    mockPostContentTypography.content,
    mockPostContentLinks.content,
    mockPostContentLists.content,
    mockPostContentMedia.content,
    mockPostContentGutenberg.content,
    mockPostContentTable.content,
    mockPostContentCode.content,
    mockPostContentDefensive.content,
  ].join('\n'),
};
