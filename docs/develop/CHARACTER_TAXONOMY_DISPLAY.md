# character taxonomy 表示実装 指示書

> 対象: Next.js フロントエンド（katsumascore-front）
> 作成日: 2026-06-06
> ステータス: 開発中

---

## ■ 概要

WordPress の `character` taxonomy を使い、登場人物（actors_filed リピーター）から
character ページへのリンクを表示する。

**ユーザー体験のゴール:**
- 投稿詳細ページの登場人物欄に、character taxonomy に紐づいたキャラクターのリンクを表示する
- キャラクターページ（`/character/[slug]`）で、そのキャラクターが登場する投稿一覧を表示する

---

## ■ データ構造（WordPress側）

### actors_filed リピーター（wp_postmeta）

```
actors_filed_0_character        = "トニー・スターク / アイアンマン"  // テキスト
actors_filed_0_link_to_character = "1"                              // 紐づけフラグ
actors_filed_0_character_term   = "10058"                           // character term_id
```

### character taxonomy ターム構造

```
character
├── marvel-characters（マーベルキャラクター）
│   ├── iron-man（アイアンマン）        term_id: 10058
│   ├── spider-man（スパイダーマン）    term_id: 10051
│   ├── captain-america               term_id: 10056
│   ├── doctor-strange                term_id: 10057
│   ├── black-panther                 term_id: 10055
│   ├── thor（マイティ・ソー）         term_id: 10059
│   └── ant-man（アントマン）          term_id: 10054
└── dc-characters（DCキャラクター）
    └── batman（バットマン）            term_id: 10061
```

### REST API エンドポイント

```
# character taxonomy 全ターム一覧
GET /wp-json/wp/v2/character?per_page=100&_fields=id,slug,name,parent,link

# character slug でターム取得
GET /wp-json/wp/v2/character?slug=iron-man&_fields=id,slug,name,parent,link

# character term_id で投稿一覧取得
GET /wp-json/wp/v2/posts?character=10058&per_page=20&_embed&acf_format=standard
```

---

## ■ 実装ステップ

### STEP 1: 型定義の追加

**ファイル:** `src/types/character.ts`（新規作成）

```ts
export type Character = {
  id: number;
  slug: string;
  name: string;
  parent: number;       // 0 = ルート（marvel-characters等）
  parentSlug?: string;  // 親スラッグ（marvel-characters等）
};
```

**ファイル:** `src/types/post.ts`（既存）

`ActorEntry` 型に `characterTerm` を追加する：

```ts
export type ActorEntry = {
  actor: { name: string; slug: string } | null;
  character: string;        // テキスト（登場人物名）
  description: string;
  linkToCharacter: boolean; // link_to_character フラグ
  characterTerm?: {         // 追加
    id: number;
    slug: string;
    name: string;
  } | null;
};
```

---

### STEP 2: WordPress API lib の追加

**ファイル:** `src/libs/api/wordpress/` 配下の適切なファイルに追加

```ts
// character taxonomy ターム一覧を取得
export const getAllCharacterTerms = async (): Promise<Character[]> => { ... }

// slug で character ターム単体を取得
export const getCharacterBySlug = async (slug: string): Promise<Character | null> => { ... }

// character term_id で投稿一覧を取得
export const getPostsByCharacterTermId = async (termId: number): Promise<Post[]> => { ... }

// character term_id でスラッグに変換（キャッシュ推奨）
export const getCharacterSlugById = async (termId: number): Promise<string | null> => { ... }
```

---

### STEP 3: actors_filed の正規化に character_term を追加

**ファイル:** `src/libs/buildPostDetailFromWp/creditsActors.ts`（既存）

`actors_filed` リピーターの各行を処理する際、`link_to_character` と `character_term` を読み取る：

```ts
// 既存の actorFieldSchema に追加（schema.ts）
const actorFieldSchema = z.object({
  character: z.string().optional(),
  description: z.string().optional(),
  actor: z.unknown().optional(),
  link_to_character: z.union([z.boolean(), z.number(), z.string()]).optional(), // 追加
  character_term: z.union([z.number(), z.string()]).optional(),                 // 追加
}).passthrough();
```

正規化ロジック：

```ts
const linkToCharacter = Boolean(Number(row.link_to_character));
const characterTermId = row.character_term ? Number(row.character_term) : null;

// character_term_id → slug の変換は getCharacterSlugById で行う
```

---

### STEP 4: キャラクターページの作成

**ファイル:** `src/pages/character/[slug].tsx`（新規作成）

```
// ISR: revalidate REVALIDATE_LOW — character（キャラクター）特集ページ
```

- `getStaticPaths`: `getAllCharacterTerms()` で全スラッグ取得（親タームは除外）
- `getStaticProps`: `getCharacterBySlug(slug)` + `getPostsByCharacterTermId(term.id)` で投稿一覧取得
- レンダリング: `CharacterTemplate` でラップ

---

### STEP 5: CharacterTemplate の作成

**ファイル:** `src/components/templates/CharacterTemplate/index.tsx`（新規作成）

- `PageLayout` でラップ必須
- props: `character: Character`, `posts: Post[]`, `breadcrumbs`
- 表示内容:
  - キャラクター名
  - 親カテゴリ（marvel-characters →「マーベルキャラクター」）
  - 投稿一覧（既存の PostCard コンポーネントを使用）

---

### STEP 6: 投稿詳細の登場人物欄にリンクを追加

**ファイル:** 登場人物を表示している ui-section または features コンポーネント

`linkToCharacter === true` の場合、登場人物名の横に `/character/[slug]` へのリンクを表示する：

```tsx
{entry.linkToCharacter && entry.characterTerm && (
  <Link href={`/character/${entry.characterTerm.slug}`}>
    {entry.characterTerm.name}
  </Link>
)}
```

---

## ■ ルーティング

| URL | 内容 |
|---|---|
| `/character/iron-man` | アイアンマンが登場する投稿一覧 |
| `/character/spider-man` | スパイダーマンが登場する投稿一覧 |
| `/character/batman` | バットマンが登場する投稿一覧 |

---

## ■ 注意事項

- 親ターム（`marvel-characters`, `dc-characters`）はページを作らない（`parent === 0` を除外）
- `character_term` は term_id（数値）で格納されているため、表示時は slug に変換が必要
- `link_to_character = 0` の行は character taxonomy と無関係のため、リンクを表示しない
- ISR の `revalidate` は `REVALIDATE_LOW` を使用する
- `docs/FEATURE_LIST.md` を同じコミットで更新すること（§1ページ一覧・§3コンポーネント・§4ライブラリ関数・§6型定義）
