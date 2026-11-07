# 特集固定ページのSEO情報欠落

- 調査日: 2026年11月7日
- 対象: https://katsumascore.blog/ja/the-lord-of-the-rings-trilogy
- 修正ブランチ: `bug/featured-page-seo`
- `bug` は既存の `bug/build-time-wp-unreachable` とGitの参照名が衝突するため作成できず、上記の名前を使用。

## 調査結果

公開ページはHTTP 200を返すが、初期HTMLにはdescription、OGP、Twitter Card、canonicalがなく、titleも空だった。
`__NEXT_DATA__` のルートは `/[slug]`、pagePropsはtitle・html・localeのみ。タイトルのデータ自体は存在した。

WordPress RESTの `/wp-json/wp/v2/pages?slug=the-lord-of-the-rings-trilogy` で対象固定ページ（ID: 19769）を確認。
ACFの `description` は空でない文字列として設定済みで、抜粋も存在した。

原因は次の2点。

1. `normalizePageContent` がタイトルと本文しか正規化せず、固定ページの `Head` にもtitle以外のSEOタグが未実装だった。
2. `<title>{title} | KatsumaScore</title>` は複数のchildrenを持つ。使用中のReact 19.3.1のサーバーレンダリングでは警告とともに `<title></title>` になることを最小コードで再現した。テンプレート文字列を1つ渡す形式では正常に出力された。

今回は固定ページのデータ受け渡しとReactのtitle記述の問題であり、OpenNext / Cloudflare固有の障害は確認していない。

## 修正内容

- 固定ページのdescriptionを正規化し、ACFを優先。未設定・不正な補助値は抜粋、本文、タイトルの順に補完する。自動生成する説明は160文字まで。
- WordPress固定ページのOpenAPI定義に抜粋とACF descriptionを追加し、型を再生成。descriptionはunknownとして受け取り、正規化時に文字列を採用する。
- description、OGP、Twitter Card、ロケール付きcanonicalを固定ページに出力する。
- 固定ページ専用のOG画像は追加せず、Twitter Cardはsummaryとする。既存SeoHeadが参照する `/og-default.png` はpublic配下に存在せず、今回は流用しない。
- titleは単一の文字列で渡す。
- 正常な固定ページは引き続きSSGとし、revalidateは追加しない。

## 検証

- 固定ページのgetStaticPropsからHeadまでACF descriptionを受け渡し、title・description・OGP・Twitter・canonicalをサーバーレンダリングする回帰テストを追加。
- 未設定値（undefined / null / false / 空文字列 / 配列）、不正な数値、抜粋・本文・タイトルの補完、160文字制限を検証。
- `node --import tsx --test tests/unit/ssg-pages.test.ts`: 19件成功。
- `npm run typecheck`: 成功。
- `npm run test:ssg`: 67件成功。初回はサンドボックスのローカルlisten制限で1件失敗したため、権限付きで再実行して全件成功を確認。
- 変更したページ・正規化処理のESLint: 成功。

本番反映後は対象URLの初期HTMLを再取得し、SEOタグを確認する。正常な固定ページにrevalidateがないため、反映には修正版の再ビルド・デプロイが必要。

## 追記: 親子URLの統一と301転送

WordPress RESTで対象ページのparentが19766、親ページ（ID: 19766）のslugが `featured-article` であることを確認。

- 新しい正規URL: `https://katsumascore.blog/ja/featured-article/the-lord-of-the-rings-trilogy`
- 旧URL: `https://katsumascore.blog/ja/the-lord-of-the-rings-trilogy`
- 旧URLは `getStaticProps` の `statusCode: 301` で新URLへ転送する。`permanent: true` による308は使用しない。
- 固定ページの祖先を含む親子階層を公開URLに反映し、階層ルートをSSG生成する。旧フラットURLは301用に維持する。
- Next.jsのビルド時SSGではgetStaticPropsのredirectが禁止されるため、旧フラットURLは事前生成から除外する。旧URLへの初回アクセスはfallback blockingで301を生成する。
- canonical・OG URL・TOPの特集リンクも階層URLに変更する。
- 既存の専用季節レビュールートは優先し、階層ルートの事前生成対象から除く。
- URLのルールを `AGENTS.md` に明文化し、SSGの生成レポート対象にも階層ルートを追加。
- 親子URLの表示、旧URLの301、言語の保持、祖先パス生成、親の欠落・循環を回帰テストで検証する。
- 追記分の検証: `npm run typecheck`、変更対象のESLint、`npm run test:ssg`（69件）成功。
