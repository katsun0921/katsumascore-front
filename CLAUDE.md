# KatsumaScore フロントエンド設計・移行ガイド（CLAUDE.md）

> v4.6 ― 200行以内に分割。詳細は `.claude/rules/` へ移動
> 2026年5月16日

## ■ 本ドキュメントの位置付け

最重要ルールのみを記載する。詳細は以下の rules ファイルを参照する。

> **関連ドキュメント**
> - コンポーネント設計: @.claude/rules/src/components.md
> - スタイリング: @.claude/rules/styling.md
> - libs 関数仕様: @.claude/rules/src/libs.md
> - i18n実装: @.claude/rules/src/components/i18n-implementation.md
> - パッケージ情報: @package.json

---

## ■ Claude Code ワークフロー（推奨）

### 作業の進め方

大きな変更・不慣れなコードへの修正は、必ず以下の順序で進める：

1. **Explore（調査）** — plan mode でコードを読み、変更箇所を把握する
2. **Plan（設計）** — 変更ファイルと実装方針を明示する
3. **Implement（実装）** — テストを書き、実装し、検証する
4. **Commit（コミット）** — 説明的なコミットメッセージで変更を記録する

小さな変更（typo修正・変数名変更・1ファイルのみの修正）は Explore/Plan を省略してよい。

### 検証基準を必ず指定する（IMPORTANT）

Claude に実装を依頼するときは、**「どうすれば正しいか確認できるか」を必ず伝える**。

```
✅ 正しい依頼の例
「validateEmail 関数を実装してください。
テストケース: user@example.com → true、invalid → false。
実装後に npm test を実行して確認してください。」

❌ 不十分な例
「validateEmail を実装してください。」
```

- テストがある場合: `npm test` / `npm run lint` の実行を指示する
- UIの変更: スクリーンショットとの比較を指示する
- ビルドエラー: エラー全文を貼り付け、根本原因の修正を指示する

### コンテキスト管理（IMPORTANT）

| 状況 | 対応 |
|------|------|
| 無関係なタスクへ移行するとき | `/clear` でコンテキストをリセットする |
| 同じ修正を2回以上やり直したとき | `/clear` して、より具体的なプロンプトで再開する |
| 調査に大量のファイル読み込みが必要なとき | サブエージェントに委譲して main コンテキストを汚染しない |
| 長期タスクで途中終了したとき | `claude --continue` で再開する |
| コンテキスト使用量を確認したいとき | `/context` で何が容量を消費しているか確認する |
| 部分的に圧縮したいとき | `/compact focus on the API changes` のように指示付きで圧縮する |
| 変更をやり直したいとき | `Esc + Esc` または `/rewind` で以前の状態に戻す |

### CLAUDE.md 自体のメンテナンス

- 各ルールについて「これがないと Claude が間違えるか？」を確認する
- YESなら残す / NOなら削除する
- **目安は200行以内**。超えたら参照ドキュメントはスキル（`.claude/skills/`）へ移動する
- ルールが無視されていると感じたら CLAUDE.md が肥大化しているサイン → 精査して削る
- 言語・ディレクトリ固有のルールは `.claude/rules/` に分割できる（パス指定で自動ロード）
- 繰り返し呼び出すワークフローは `.claude/skills/` にスキルとして保存する（`/<name>` で呼び出し）

### docs/FEATURE_LIST.md のメンテナンス（IMPORTANT）

**新機能の追加・既存機能の削除・大きなリファクタリングを行ったときは、必ず `docs/FEATURE_LIST.md` を同じコミット内で更新する。**

| 変更の種類 | 更新対象セクション |
|-----------|-----------------|
| ページ追加 / 削除 | §1 ページ一覧 |
| API エンドポイント追加 / 削除 | §2 API エンドポイント |
| コンポーネント追加 / 削除 / 別レイヤーへ移動 | §3 コンポーネント一覧 |
| lib 関数・hooks 追加 / 削除 | §4 ライブラリ関数 / §5 Hooks |
| 型定義追加 / 削除 | §6 型定義 |
| 翻訳ファイル追加 / 削除 | §7 i18n |
| `docs/develop/` → `docs/features/` へ昇格（仕様公開） | §10 関連ドキュメント |

> **docs/ ディレクトリ構成:** `features/`（使用中）/ `develop/`（開発中）/ `idea/`（未着手）/ `archive/`（完了・見送り）。詳細は [`docs/README.md`](docs/README.md) を参照。

---

## ■ GitHub 運用ルール

### PR 記述言語（必須）

**PR のタイトル・本文はすべて日本語で記述する。**

| 項目 | ルール |
|------|--------|
| タイトル | `feature:` または `bug:` prefix + 日本語要約 |
| 概要 | 日本語で記述 |
| コード変更サマリー | 日本語で記述 |

---

## ■ 最重要原則（必読）

### レイヤー責務

| レイヤー | 役割 | ルール |
|----------|------|--------|
| ui-parts | 純粋UI | propsの値を表示のみ。hooks/state禁止 |
| ui-layout | 構造 | ロジック禁止。childrenで構成 |
| ui-section | 意味を持つUIまとまり | ロジック禁止。データはpropsで受け取る |
| ui-home | Home専用UI | ロジック禁止。HomeTemplateからのみ参照 |
| features | ロジック | hooks/state使用可 |
| templates | 画面構造 | PageLayoutでラップ必須 |

**配置フローチャート:** ロジックあり → features / 意味あるUI → ui-section / レイアウト → ui-layout / それ以外 → ui-parts

### WordPress依存の隔離

❌ 禁止: `post.title.rendered`  
✅ 必須: `normalizedPost.title`

---

## ■ 禁止ルール

**YOU MUST NOT** 以下を行うこと：

- fetchをcomponents内で使用・WordPressレスポンスを直接使用・any型の使用
- ハードコードカラー（`#xxxxxx`）・Tailwindの色指定（`bg-blue-500`など）
- `<a href>` によるページ遷移 → `<Link>` 使用 / `<img>` → `<Image>` 使用
- `function` キーワードによる関数宣言 → Arrow関数のみ（`.tsx` / `.ts` すべて）
- ネストした三項演算子・`if-else if` チェーン・`switch` 文
- 1ディレクトリに複数コンポーネントを配置
- どこからもimportされていないファイルを放置する → **削除する**。残す場合はファイル先頭に理由をコメントで明記する

---

## ■ レンダリング方式（厳守）

| ページ種別 | 方式 | 備考 |
|-----------|------|------|
| 固定ページ / LP | SSG | `getStaticProps` |
| 記事 | ISR | `revalidate` を設定する |
| TOP | ISR + client fetch | パーソナライズは client-side fetch |
| VOD | SSR | VODページのみ。他への拡大禁止 |

- ページファイルには必ずレンダリング方式をコメントで明記する

---

## ■ データフロー

```
WordPress API → lib/api → features（正規化） → components → pages
```

- **言語判定:** ACF `lang` フィールドを正とする（`detectLang`）
- **最終フィルタ:** `normalizePosts` / `mapWPPostToPost` 後の `m.lang` で行う

---

## Compact Instructions

コンテキスト圧縮時に必ず保持する情報：

- 変更済みファイルの一覧
- 実行中のタスクとその目的
- テストコマンド（`npm test` / `npm run lint` / `npm run lint:scss`）
- 未解決の問題・エラーの内容

---

## ■ 最終指針

このプロジェクトは「WordPressテーマの移植」ではない。
"再設計されたフロントエンド"である。
