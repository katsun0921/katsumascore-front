# KatsumaScore 新着 × VOD連携設計書（実装タスク分解版）

## ■ 概要
劇場レビューとVOD新着を連携し、CTR最大化を目的とした導線を構築する。

---

## ■ コンセプト
レビュー（感情） → 新着（行動）

---

## ■ データ設計（ACF）
{
  "theatrical_release_date": "2025-12-01",
  "vod_release": [
    {
      "platform": "netflix",
      "start_date": "2026-04-28"
    }
  ],
  "review_score": 4.3
}

---

## ■ API設計
GET /api/new-releases

---

## ■ UI設計（強い形）
🔥 劇場公開時 4.3の話題作  
本日Netflix配信開始  

〇〇  
[レビューを読む] [今すぐ観る]

---

# ■ 実装タスク分解（Claude Code用）

## ■ Phase 1：WordPress（データ準備）

- [ ] ACFフィールド追加
  - theatrical_release_date
  - vod_release（Repeater）
  - review_score

- [ ] REST APIでACF公開
- [ ] slugとVODデータの整合性確認

---

## ■ Phase 2：データ取得層（Next.js）

- [ ] lib/api/newReleases.ts 作成
- [ ] WP REST APIからデータ取得
- [ ] VOD API（/api/vod）と統合

---

## ■ Phase 3：Workers API

- [ ] /api/new-releases 実装
- [ ] 新着判定ロジック（3日以内）
- [ ] D1 or KVからデータ取得
- [ ] JSON整形レスポンス

---

## ■ Phase 4：スコア統合（任意）

- [ ] review_score付与
- [ ] 表示用スコアフォーマット

---

## ■ Phase 5：UIコンポーネント

- [ ] NewReleaseSection.tsx
- [ ] NewReleaseCard.tsx
- [ ] ScoreBadge.tsx
- [ ] VODLabel.tsx
- [ ] CTA Button（Review / Watch）

---

## ■ Phase 6：スタイリング

- [ ] Tailwind Token適用
- [ ] Scoreの強調表示
- [ ] CTAの視認性確保

---

## ■ Phase 7：SSR / ISR

- [ ] getServerSideProps or ISR選定
- [ ] キャッシュTTL設定（6〜12時間）

---

## ■ Phase 8：導線設計

- [ ] Reviewリンク
- [ ] VODリンク（アフィリエイト対応）
- [ ] クリックイベント計測

---

## ■ Phase 9：KPI計測

- [ ] CTR（レビュー）
- [ ] CTR（VOD）
- [ ] 滞在時間
- [ ] 回遊率

---

## ■ Phase 10：拡張

- [ ] 急上昇連携
- [ ] 市場ランキング連携
- [ ] パーソナライズ

---

## ■ 結論

本設計は「レビュー資産」を「視聴行動」に変換する中核機能である。
