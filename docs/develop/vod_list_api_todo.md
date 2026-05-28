# VOD 一覧 API パフォーマンス改善 TODO

> 対象: VOD タクソノミー別記事一覧（`/vod/[slug]?page=N`）の API 化対応
> ブランチ: `claude/vod-list-performance-x4CcM`
> 仕様: [`vod_list_api_spec.md`](./vod_list_api_spec.md)
> 最終更新: 2026-05-28

---

## ■ 概要

VOD 一覧の SSR を、WordPress 側の新エンドポイント `katsumascore/v1/vod-list` に切り替える。
フィルタ・ソート・ページネーションを API 側へ寄せ、フロントは 1 リクエストで完結させる。

詳細な API 仕様は [`vod_list_api_spec.md`](./vod_list_api_spec.md) を参照。

---

## ■ TODO

### Phase 0: 設計確定

- [ ] 本仕様書のレビュー（特にソート種別 `streaming` の対象 ACF フィールド名）
- [ ] `genre` / `tag` のスラッグ仕様確認（複数指定時の AND / OR）
- [ ] レスポンスの言語フィルタ仕様確認（`lang=ja` で `en` 記事を完全除外でよいか）

### Phase 1: WordPress 側エンドポイント実装（別リポジトリ）

> 詳細は `vod_list_api_spec.md` の「実装方針（WordPress 側）」を参照。

- [ ] `katsumascore/v1/vod-list` ルート登録
- [ ] `$wpdb` 直接クエリでベース投稿リスト取得
- [ ] ACF メタ一括取得（`score` / `lang` / 配信開始日）
- [ ] タクソノミー一括取得（`vod` / `genre` / `tag`）
- [ ] アイキャッチ URL の集約
- [ ] ソート（`new` / `score` / `streaming`）実装
- [ ] フィルタ（`genre` / `tag`）実装
- [ ] `Cache-Control` ヘッダ付与
- [ ] エラーレスポンス実装

### Phase 2: Next.js 側差し替え

- [ ] `openapi/wp.yaml` に新エンドポイントのスキーマ追加 → `npm run wp:gen-types`
- [ ] `src/libs/api/wordpress/endpoints/vodList.ts` 新設
  - `getVodList({ vod, lang, page, perPage, filter, genre, tag })`
  - 型は OpenAPI から自動生成
- [ ] `src/libs/loadVodArchivePage.ts` を 1 リクエスト化に書き換え
  - 全ページ逐次ループ削除（現状 `:75-90`）
  - `normalizePosts` をエンドポイント側に寄せる or 簡素化
- [ ] `src/pages/vod/[slug]/index.tsx` の `getStaticProps` / `getServerSideProps` 更新
- [ ] クライアント側フィルタ撤去（`src/utils/listFilters.ts` の VOD 用関数）
- [ ] フィルタ UI の URL 連動対応（`URLSearchParams` 経由で API へ伝搬）
- [ ] ページネーションコンポーネントが `meta.totalPages` を参照する形に変更

### Phase 3: 検証

- [ ] WP API への直接リクエストで件数・順序・フィルタ動作確認（`curl`）
- [ ] `npm run lint` / `npm run lint:scss`
- [ ] ローカルで `/vod/netflix?page=1`〜`?page=N` の表示確認
- [ ] 各フィルタ（`filter=score`、`genre=action`、`tag=2024`）の動作確認
- [ ] レスポンスサイズ計測（Before / After）
- [ ] SSR 所要時間計測（Before / After）

### Phase 4: ドキュメント更新

- [ ] 完了後 `vod_list_api_spec.md` / `vod_list_api_todo.md` → `docs/features/` へ移動
- [ ] `docs/FEATURE_LIST.md` §2 API エンドポイントに追加
- [ ] `.claude/rules/src/libs.md` の wordpress.ts 関数一覧に `getVodList` 追加

---

## ■ 関連ファイル（フロント側）

- `src/libs/loadVodArchivePage.ts` — 既存のローダー（差し替え対象）
- `src/libs/api/wordpress/endpoints/posts.ts` — 既存の posts 取得（参考）
- `src/pages/vod/[slug]/index.tsx` — VOD 一覧ページ（呼び出し元）
- `src/utils/listFilters.ts` — クライアント側フィルタ（撤去対象）
- `openapi/wp.yaml` — OpenAPI スキーマ（追記対象）
