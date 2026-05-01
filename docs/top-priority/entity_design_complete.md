# ■ Entity統合設計 完全版（person / company）

## ■ 概要
本設計は、actor / director / company を統合し、
taxonomyからCPTへ移行するための最終設計である。

---

# ■ 1. データ構造

## ■ Entityレイヤー

- person（人物）
- company（企業）

## ■ Taxonomyレイヤー

- genre
- tag
- franchise

👉 分類と実体を完全分離

---

# ■ 2. person設計

## ■ CPT
person

## ■ ACF（Person）

| フィールド | 型 |
|----------|----|
| name | text |
| slug | slug |
| roles | checkbox（actor, director） |
| bio | textarea |
| image | image |

---

## ■ Postとの関係

| フィールド | 型 |
|----------|----|
| cast | relationship（person） |
| director | relationship（person） |

---

# ■ 3. company設計

## ■ CPT
company

## ■ ACF（Company）

| フィールド | 型 |
|----------|----|
| name | text |
| slug | slug |
| roles | checkbox（production, distributor） |
| description | textarea |
| logo | image |

---

## ■ Postとの関係

| フィールド | 型 |
|----------|----|
| production_companies | relationship |
| distributors | relationship |

---

# ■ 4. URL設計

/person/[slug]
/company/[slug]

---

# ■ 5. route設計

```ts
export function getEntityUrl(type: 'person' | 'company', slug: string, lang = 'ja') {
  return `/${lang}/${type}/${slug}`
}
```

---

# ■ 6. パンくず

## ■ person
Home > Person > Name

## ■ company
Home > Company > Name

---

# ■ 7. UI設計

## ■ Personページ

- プロフィール
- 出演作品一覧
- 監督作品一覧
- 平均スコア

---

## ■ Companyページ

- 概要
- 制作作品一覧
- 配給作品一覧

---

# ■ 8. 移行戦略

## Phase1
taxonomy運用（現状）

## Phase2
CPT導入

## Phase3
完全移行

---

# ■ 9. リダイレクト

/actor/[slug] → /person/[slug]
/director/[slug] → /person/[slug]

/production/[slug] → /company/[slug]
/distributor/[slug] → /company/[slug]

（301必須）

---

# ■ 10. SEO

- entityページをインデックス対象にする
- 内部リンクのハブ化
- canonical統一

---

# ■ 11. 技術注意

- slugは絶対固定
- 重複禁止
- route抽象化必須

---

# ■ 12. 結論

人・会社は「分類」ではなく「主役」

taxonomyは整理するためのもの  
entityは価値を生むためのもの
