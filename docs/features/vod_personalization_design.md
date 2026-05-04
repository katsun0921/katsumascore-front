# KatsumaScore VODパーソナライズ & 通知機能設計

## ■ 概要

本ドキュメントは以下の機能を既存アーキテクチャに統合する設計を定義する。

1. 新シリーズ一覧表示
2. ユーザーのVOD契約ベースのフィルタリング
3. エピソード更新時の通知（PWA）

---

## ■ 目的

- 再訪率の向上
- ユーザーごとの最適化（パーソナライズ）
- VOD導線の最適化

---

## ■ 設計思想

「見られる作品だけを提示する」

Discovery → Interest → Revisit の導線を構築

---

## ■ システム統合ポイント

### ■ 統合レイヤー

本機能は「Seriesレイヤー」に統合する

理由：
- VOD情報はSeries単位で管理されている
- 既存ACFにVODフラグが存在

---

## ■ データ構造

### ■ Series（既存）

- streaming_vod_netflix
- streaming_vod_amazon
- streaming_vod_unext

### ■ User（新規・フロント管理）

```ts
type UserVOD = {
  netflix: boolean;
  amazon: boolean;
  unext: boolean;
  hulu: boolean;
};
```

---

## ■ フィルタリングロジック

```ts
const filtered = series.filter(s => {
  return (
    (user.netflix && s.vod_netflix) ||
    (user.amazon && s.vod_amazon) ||
    (user.unext && s.vod_unext)
  );
});
```

---

## ■ UI設計

### ■ ① VOD選択UI
- 初回モーダル
- ローカルストレージ保存

### ■ ② シリーズ一覧
- 視聴可能作品のみ表示
- またはグレーアウト

### ■ ③ トップページ

変更前：
- 今期のシリーズ一覧

変更後：
- あなたが見られる今期シリーズ

---

## ■ 通知設計（PWA）

### ■ トリガー
- 新エピソード公開
- 配信開始

### ■ 条件

```ts
if (
  user.netflix && series.vod_netflix &&
  newEpisodePublished
) {
  notify();
}
```

---

## ■ アーキテクチャ連携

### ■ 使用技術
- Next.js（フロント）
- Cloudflare Workers（通知判定）
- WordPress REST API（データ）

---

## ■ データフロー

1. ユーザーがVOD選択（localStorage）
2. Series一覧取得（REST API）
3. フロントでフィルタリング
4. Workersがエピソード更新検知
5. 条件一致で通知

---

## ■ Franchiseとの関係

- Franchise：構造（変更なし）
- Series：配信状態（拡張対象）
- User：嗜好・契約（新規）

---

## ■ 拡張案

- VOD別ページ（/vod/netflix）
- パーソナライズランキング
- スコア変動通知

---

## ■ リスク

- 通知過多 → 頻度制御
- データ精度 → VOD更新管理
- フィルタ過剰 → OFF切替

---

## ■ 実装ステップ

1. VOD選択UI
2. localStorage設計
3. Seriesフィルタリング
4. トップページ反映
5. 通知実装（Service Worker）

---

## ■ 結論

本機能は既存アーキテクチャを変更せずに統合可能。

Seriesレイヤーにユーザー文脈を追加することで、
メディアからプロダクトへの進化を実現する。
