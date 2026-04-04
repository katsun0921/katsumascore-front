# KatsumaScore Storybook移行設計書（最終版）

## ■ 参照ルート

本ドキュメントは以下ディレクトリを基準とする：

    ./katsumascore_wordpress_theme/

------------------------------------------------------------------------

## ■ 目的

WordPressテーマのUIを完全に分解し、
StorybookをUIの唯一の定義として再構築する。

------------------------------------------------------------------------

## ■ 最重要原則

### ■ データ非改変

-   WordPress DB構造は変更しない
-   ACFフィールドは変更しない
-   REST APIレスポンスは変更しない

UIのみを再設計する。

------------------------------------------------------------------------

## ■ アプローチ

1.  template-parts を中心にUIを抽出
2.  PHPロジックは除外
3.  UIコンポーネント単位で再構成
4.  Storybookへ移植

------------------------------------------------------------------------

## ■ Storybook最終構造（確定）

    components/
    ├── ui/
    │   ├── Score
    │   ├── Heading
    │   ├── Date
    │   ├── Badge
    │   ├── Pagination
    │   ├── SocialIcons
    │   ├── Breadcrumb
    │   ├── SearchBox
    │   ├── VideoEmbed
    │
    ├── features/
    │   ├── PostCard
    │   ├── PostList
    │   ├── VodPanel
    │   ├── ArticleHeader
    │   ├── ArticleMeta
    │   ├── AuthorCard
    │   ├── BasicInfo
    │   ├── CreditInfo
    │   ├── ShareButtons
    │   ├── Carousel
    │   ├── ArticleBlock
    │
    ├── layout/
    │   ├── Header
    │   ├── Footer
    │   ├── Sidebar
    │   ├── Container
    │   ├── Grid

------------------------------------------------------------------------

## ■ マッピングルール

  WordPress                    Storybook
  ---------------------------- -----------------------
  template-parts/components    features/ui
  template-parts/post          features
  template-parts/plugins/acf   features/ArticleBlock
  header.php                   layout/Header
  footer.php                   layout/Footer
  sidebar.php                  layout/Sidebar

------------------------------------------------------------------------

## ■ UI分類

### ■ ui（最小単位）

-   再利用可能な純粋UI

### ■ features（機能単位）

-   複数UIの組み合わせ

### ■ layout（構造）

-   ページ構造

------------------------------------------------------------------------

## ■ 除外対象

以下はStorybook対象外：

-   functions.php
-   inc/\*
-   js/\*
-   libs/\*
-   WordPressロジック

------------------------------------------------------------------------

## ■ 結論

本設計はWordPressテーマの移植ではない。

UIを再定義し、 フロントエンドの責務を分離するための設計である。
