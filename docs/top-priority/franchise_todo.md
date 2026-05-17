# Franchise（シリーズ）特集ページ Todo

> 詳細な設計は[設計書](../features/franchise_acf_design.md)を参照。

## 実装Todo（フェーズ8）

- [ ] WordPress側: franchise taxonomy + ACFフィールド設定
- [ ] `lib/api/wordpress.ts`に`getPostsByFranchise(slug)`を追加
- [ ] `transformPost()`でfranchise ACFフィールドを正規化
- [ ] `pages/franchise/[slug].tsx`の新規作成（ISR）
- [ ] FranchiseTemplateの実装（Hero/概要/ハイライト/年表/作品一覧/スコア比較/CTA）
- [ ] SEO: titleはシリーズ名+ガイド、descriptionはシリーズ概要要約
