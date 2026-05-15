---
name: create-pr
description: このリポジトリ（katsun0921/katsumascore-front）用のPRを作成または更新する。.github/pull_request_template.md のテンプレートをすべて日本語で埋め、チェックボックスを変更内容に基づいて適切に設定する。
---

# PR作成スキル（katsumascore-front）

このリポジトリの `.github/pull_request_template.md` テンプレートに従い、日本語でPRを作成または更新する。

## ワークフロー

### 1. 変更内容を把握する

以下を並列で実行する：

```bash
# mainとの差分コミット一覧
git log --oneline origin/main..HEAD

# 変更ファイルと差分
git diff origin/main...HEAD --stat
git diff origin/main...HEAD
```

### 2. PRテンプレートを読む

```
.github/pull_request_template.md
```

### 3. 現在のブランチ名を取得する

```bash
git branch --show-current
```

### 4. 既存PRを確認する

`mcp__github__list_pull_requests` ツールを使用する：
- owner: `katsun0921`
- repo: `katsumascore-front`
- head: `katsun0921:<現在のブランチ名>`
- state: `open`

### 5. テンプレートを日本語で埋める

**必須ルール（CLAUDE.md準拠）：**
- タイトル形式: `feature: 〇〇を追加` または `bug: 〇〇を修正`
- タイトル・本文はすべて日本語で記述する
- 変更種別のチェックボックスは実際の変更に合わせて `[x]` にする

**各セクションの埋め方：**

| セクション | 記述内容 |
|---|---|
| 変更種別 | 変更の種類に該当する項目を `[x]` にする |
| 概要 | 何を・なぜ変更したかを日本語で記述 |
| コード変更サマリー | 変更ファイル・変更内容を具体的に箇条書き |
| レイヤー設計チェック | 変更に関係するルールのみ確認。コンポーネント変更がなければすべて `[x]` |
| スタイリングチェック | スタイル変更がなければすべて `[x]` |
| Storybookチェック | 新規コンポーネントなしなら「※対象外」として `[x]` |
| i18nチェック | i18n変更なしなら「※今回はi18n変更なし」として `[x]` |
| レンダリング方式チェック | ページ変更なしなら「※今回はページ変更なし」として `[x]` |
| スクリーンショット | UI変更なしなら「UI変更なし」と記述。ある場合はBefore/Afterを記載 |
| 関連Issue | 関連するIssue番号があれば `Closes #xxx`、なければ経緯を簡潔に |

### 6. PRを作成または更新する

**既存PRがある場合** → `mcp__github__update_pull_request` で本文を更新する
- owner: `katsun0921`
- repo: `katsumascore-front`
- pullNumber: 既存のPR番号

**既存PRがない場合** → `mcp__github__create_pull_request` で新規作成する
- owner: `katsun0921`
- repo: `katsumascore-front`
- head: 現在のブランチ名
- base: `main`

## 完了後の報告

- PRのURL（`https://github.com/katsun0921/katsumascore-front/pull/<番号>`）を伝える
- 作成か更新かを明示する
