# カラールール & Tailwind × Design Token 責務（最終版）

> KatsumaScore フロントエンド設計仕様  
> 2026年4月

---

# ■ カラールール

## ■ 方針

カラーは「役割」で管理する。  
直接値を使用せず、必ずDesign Tokenを経由する。

---

## ■ カラーパレット

### ■ Primary（ブランドの軸）
```
#2563eb
```

- 用途：CTA / リンク / アクティブ状態
- 意味：信頼・知性・操作

---

### ■ Secondary（世界観）
```
#1e1b4b
```

- 用途：Header / Footer / 背景アクセント
- 意味：深み・映画レビューの重厚感

---

### ■ Accent（補助）
```
#6d28d9
```

- 用途：補助UI
- 原則：多用しない

---

### ■ Score（最重要）
```
背景: #14082e
枠線: #ff2dfc
```

- 用途：評価表示
- 原則：最も目立たせる

---

### ■ Background
```
#ffffff
#f3f4f6
```

---

### ■ Text
```
#111827
#6b7280
```

---

## ■ 使用ルール

| 要素 | カラー |
|------|--------|
| CTA / リンク | primary |
| 背景 | bg |
| テキスト | text |
| 評価（Score） | score |
| 補助UI | accent |

---

## ■ 禁止事項

- 直接カラーコードを書く
- Tailwindのデフォルトカラーを使用する（例：bg-blue-500）
- 同一画面で複数の強い色を使う

---

## ■ 原則

色は「意味」で使う。  
装飾として使わない。

---

# ■ Tailwind × Design Token 責務（最終版）

## ■ 方針

TailwindとDesign Tokenは責務を明確に分離する。

---

## ■ Tailwindの責務

- layout（flex / grid）
- spacing（margin / padding）
- size（width / height）
- border-radius

---

## ■ Design Tokenの責務

- color
- typography
- shadow

---

## ■ 統合ルール

すべての視覚表現はToken経由でTailwindに流す。

---

## ■ 使用例

```tsx
<div className="p-4 bg-primary text-text-primary rounded-md">
```

---

## ■ 禁止事項

- Tailwindで色を直接指定する
- SCSSでspacingを定義する
- Tokenを使わずにスタイルを書く

---

## ■ 原則

Tailwindは「構造と配置」、  
Tokenは「意味と視覚」を定義する。
