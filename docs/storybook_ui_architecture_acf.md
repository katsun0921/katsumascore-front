# KatsumaScore Storybook移行設計書（ACF統合版）

## ■ 参照ルート

    ./katsumascore_wordpress_theme/

------------------------------------------------------------------------

## ■ 目的

WordPressテーマのUIを完全に分解し、
ACFコンポーネントを含めてStorybookへ統合する。

------------------------------------------------------------------------

## ■ 最重要原則

### ■ データ非改変

-   WordPress DB構造は変更しない
-   ACFフィールドは変更しない
-   REST APIレスポンスは変更しない

------------------------------------------------------------------------

## ■ 設計の本質

template-parts はすべて「UIコンポーネント」として扱う。\
特に以下は重要：

-   components → UI / features
-   plugins/acf → ArticleBlock（最重要）
-   post → features

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
    │
    ├── features/ArticleBlock/
    │   ├── Summary
    │   ├── GoodPoint
    │   ├── ReviewSiteScores
    │   ├── StreamingVod
    │   ├── ActorsInfo
    │   ├── ProductBlock
    │   ├── AdRental
    │   ├── CinemaCheck
    │   ├── RelationPost
    │   ├── VodItem
    │
    ├── layout/
    │   ├── Header
    │   ├── Footer
    │   ├── Sidebar
    │   ├── Container
    │   ├── Grid

------------------------------------------------------------------------

## ■ ACFコンポーネント対応

  WordPress（ACF）              Storybook
  ----------------------------- -------------------------------
  acf-summary.php               ArticleBlock/Summary
  acf-good-point.php            ArticleBlock/GoodPoint
  acf-review-site-scores.php    ArticleBlock/ReviewSiteScores
  acf-streaming-vod.php         ArticleBlock/StreamingVod
  actors-info.php               ArticleBlock/ActorsInfo
  product-block.php             ArticleBlock/ProductBlock
  ad-rental.php                 ArticleBlock/AdRental
  single-cinema-check.php       ArticleBlock/CinemaCheck
  acf-relation-by-post-id.php   ArticleBlock/RelationPost

------------------------------------------------------------------------

## ■ VOD個別コンポーネント

    vod/

→ すべて分解してUI化

  WordPress                Storybook
  ------------------------ -----------
  netflix.php              VodItem
  amazon-prime-video.php   VodItem
  u-next.php               VodItem
  disney-plus.php          VodItem

------------------------------------------------------------------------

## ■ マッピングルール（確定）

  WordPress                        Storybook
  -------------------------------- -----------------------
  template-parts/components        ui / features
  template-parts/post              features
  template-parts/plugins/acf       features/ArticleBlock
  template-parts/plugins/acf/vod   ui/VodItem

------------------------------------------------------------------------

## ■ 結論

ACFも含め、WordPressテーマのすべてのUIは
Storybookコンポーネントへ完全分解される。

WordPressは「データ定義」、 Storybookは「UI定義」として分離される。
