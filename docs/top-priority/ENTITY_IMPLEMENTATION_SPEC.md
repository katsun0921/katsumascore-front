# Entity統合設計 Phase 2 実装仕様書
## Issue #38 — person / company CPT フロントエンド実装

---

## 1. 完了済み（WordPress側）

| タスク | 状態 |
|---|---|
| `person` CPT 登録 + ACFフィールド（name_ja / name_en / slug / roles / bio / image） | ✅ |
| `company` CPT 登録 + ACFフィールド（name_ja / name_en / slug / roles / description / logo） | ✅ |
| post に `director` / `production_studio` / `film_studio` relationship フィールド追加 | ✅ |
| actor / director taxonomy → person CPT 移行 | ✅ |
| production_studio / film_studio taxonomy → company CPT 移行 | ✅ |
| `actors_filed` repeater の actor フィールドを person CPT post_id に変換 | ✅ |

---

## 2. データ取得層

### 2-1. `wp-schema.d.ts` 再生成

**ファイル**: `lib/api/wordpress/generated/wp-schema.d.ts`

追加するエンドポイント型定義：

```typescript
// Person エンドポイント
export interface WPPerson {
  id: number;
  slug: string;
  title: { rendered: string };
  acf: {
    name_ja: string;
    name_en: string;
    slug: string;
    roles: ('actor' | 'director')[];
    bio?: string;
    image?: WPImage;
  };
}

// Company エンドポイント
export interface WPCompany {
  id: number;
  slug: string;
  title: { rendered: string };
  acf: {
    name_ja: string;
    name_en: string;
    slug: string;
    roles: ('production' | 'distributor')[];
    description?: string;
    logo?: WPImage;
  };
}

// Post に追加された relationship フィールド
export interface WPPostEntityRelations {
  director?: WPPerson[];            // 監督
  production_studio?: WPCompany[];  // 制作会社
  film_studio?: WPCompany[];        // 配給会社
}
```

**REST API エンドポイント**:
- `GET /wp-json/wp/v2/persons?per_page=100`
- `GET /wp-json/wp/v2/persons/{id}`
- `GET /wp-json/wp/v2/persons?slug={slug}`
- `GET /wp-json/wp/v2/companies?per_page=100`
- `GET /wp-json/wp/v2/companies/{id}`
- `GET /wp-json/wp/v2/companies?slug={slug}`

---

### 2-2. `endpoints/persons.ts` 新設

**ファイル**: `lib/api/wordpress/endpoints/persons.ts`

```typescript
import { WPPerson } from '../generated/wp-schema';
import { fetchWP } from '../client';

// ID で person を取得
export async function getPerson(id: number): Promise<WPPerson> {
  return fetchWP<WPPerson>(`/wp/v2/persons/${id}?acf_format=standard`);
}

// slug で person を取得
export async function getPersonBySlug(slug: string): Promise<WPPerson | null> {
  const results = await fetchWP<WPPerson[]>(
    `/wp/v2/persons?slug=${slug}&acf_format=standard`
  );
  return results[0] ?? null;
}

// role で persons を取得（actor / director）
export async function getPersonsByRole(
  role: 'actor' | 'director',
  perPage = 100
): Promise<WPPerson[]> {
  return fetchWP<WPPerson[]>(
    `/wp/v2/persons?acf_format=standard&per_page=${perPage}&acf[roles]=${role}`
  );
}
```

---

### 2-3. `endpoints/companies.ts` 新設

**ファイル**: `lib/api/wordpress/endpoints/companies.ts`

```typescript
import { WPCompany } from '../generated/wp-schema';
import { fetchWP } from '../client';

// ID で company を取得
export async function getCompany(id: number): Promise<WPCompany> {
  return fetchWP<WPCompany>(`/wp/v2/companies/${id}?acf_format=standard`);
}

// slug で company を取得
export async function getCompanyBySlug(slug: string): Promise<WPCompany | null> {
  const results = await fetchWP<WPCompany[]>(
    `/wp/v2/companies?slug=${slug}&acf_format=standard`
  );
  return results[0] ?? null;
}
```

---

### 2-4. `transform.ts` 正規化処理追加

**ファイル**: `lib/api/wordpress/transform.ts`

```typescript
import { WPPerson, WPCompany } from './generated/wp-schema';

export interface Person {
  id: number;
  slug: string;
  nameJa: string;
  nameEn: string;
  roles: ('actor' | 'director')[];
  bio: string;
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
  } | null;
}

export interface Company {
  id: number;
  slug: string;
  nameJa: string;
  nameEn: string;
  roles: ('production' | 'distributor')[];
  description: string;
  logo: {
    url: string;
    alt: string;
  } | null;
}

export function transformPerson(wp: WPPerson): Person {
  const acf = wp.acf;
  return {
    id: wp.id,
    slug: acf.slug ?? wp.slug,
    nameJa: acf.name_ja ?? '',
    nameEn: acf.name_en ?? '',
    roles: acf.roles ?? [],
    bio: acf.bio ?? '',
    image: acf.image
      ? {
          url: acf.image.url,
          alt: acf.image.alt ?? acf.name_ja,
          width: acf.image.width,
          height: acf.image.height,
        }
      : null,
  };
}

export function transformCompany(wp: WPCompany): Company {
  const acf = wp.acf;
  return {
    id: wp.id,
    slug: acf.slug ?? wp.slug,
    nameJa: acf.name_ja ?? '',
    nameEn: acf.name_en ?? '',
    roles: acf.roles ?? [],
    description: acf.description ?? '',
    logo: acf.logo
      ? {
          url: acf.logo.url,
          alt: acf.logo.alt ?? acf.name_ja,
        }
      : null,
  };
}
```

---

### 2-5. `route.ts` に `getEntityUrl()` 追加

**ファイル**: `src/lib/route.ts`

```typescript
type EntityType = 'person' | 'company';
type Lang = 'ja' | 'en';

export function getEntityUrl(
  type: EntityType,
  slug: string,
  lang: Lang = 'ja'
): string {
  const prefix = lang === 'en' ? '/en' : '';
  return `${prefix}/${type}/${slug}`;
}

// 使用例
// getEntityUrl('person', 'bradley-cooper')     → '/person/bradley-cooper'
// getEntityUrl('person', 'bradley-cooper', 'en') → '/en/person/bradley-cooper'
// getEntityUrl('company', 'toho')              → '/company/toho'
```

---

## 3. ページ・テンプレート

### 3-1. `pages/person/[slug].tsx`

**ISR設定**: `revalidate: 60 * 60 * 24`（24時間）

```typescript
// pages/person/[slug].tsx
import { GetStaticPaths, GetStaticProps } from 'next';
import { getPersonBySlug } from '@/lib/api/wordpress/endpoints/persons';
import { transformPerson, Person } from '@/lib/api/wordpress/transform';
import PersonTemplate from '@/components/templates/PersonTemplate';

interface Props {
  person: Person;
}

export default function PersonPage({ person }: Props) {
  return <PersonTemplate person={person} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
  // 主要な person のみ事前生成（fallback: 'blocking' で残りをオンデマンド生成）
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const wp = await getPersonBySlug(slug);

  if (!wp) return { notFound: true };

  return {
    props: { person: transformPerson(wp) },
    revalidate: 60 * 60 * 24,
  };
};
```

**PersonTemplate 表示内容**:

| セクション | 内容 |
|---|---|
| プロフィール | 画像 / name_ja / name_en / roles / bio |
| 出演作品 | actors_filed に紐づく post 一覧（ISR） |
| 監督作品 | director フィールドに紐づく post 一覧 |
| 平均スコア | 出演作品・監督作品の KatsumaScore 平均値 |

---

### 3-2. `pages/company/[slug].tsx`

**ISR設定**: `revalidate: 60 * 60 * 24`（24時間）

```typescript
// pages/company/[slug].tsx
import { GetStaticPaths, GetStaticProps } from 'next';
import { getCompanyBySlug } from '@/lib/api/wordpress/endpoints/companies';
import { transformCompany, Company } from '@/lib/api/wordpress/transform';
import CompanyTemplate from '@/components/templates/CompanyTemplate';

interface Props {
  company: Company;
}

export default function CompanyPage({ company }: Props) {
  return <CompanyTemplate company={company} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const wp = await getCompanyBySlug(slug);

  if (!wp) return { notFound: true };

  return {
    props: { company: transformCompany(wp) },
    revalidate: 60 * 60 * 24,
  };
};
```

**CompanyTemplate 表示内容**:

| セクション | 内容 |
|---|---|
| 概要 | ロゴ / name_ja / name_en / roles / description |
| 制作作品 | production_studio フィールドに紐づく post 一覧 |
| 配給作品 | film_studio フィールドに紐づく post 一覧 |

---

### 3-3. Breadcrumb 対応

```typescript
// person ページ
const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: '人物', href: '/person' },
  { label: person.nameJa, href: getEntityUrl('person', person.slug) },
];

// company ページ
const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: '企業', href: '/company' },
  { label: company.nameJa, href: getEntityUrl('company', company.slug) },
];
```

---

### 3-4. SEO 設定

```typescript
// Person ページの Head
<Head>
  <title>{`${person.nameJa}（${person.nameEn}）| KatsumaScore`}</title>
  <meta name="description" content={person.bio?.slice(0, 120) ?? `${person.nameJa}の出演作品・監督作品一覧`} />
  <link rel="canonical" href={`https://katsumascore.blog/person/${person.slug}`} />
  {/* JSON-LD */}
  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": person.nameJa,
    "alternateName": person.nameEn,
    "image": person.image?.url,
    "description": person.bio,
  })}</script>
</Head>

// Company ページの Head
<Head>
  <title>{`${company.nameJa}（${company.nameEn}）| KatsumaScore`}</title>
  <meta name="description" content={company.description?.slice(0, 120) ?? `${company.nameJa}の制作・配給作品一覧`} />
  <link rel="canonical" href={`https://katsumascore.blog/company/${company.slug}`} />
  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": company.nameJa,
    "alternateName": company.nameEn,
    "logo": company.logo?.url,
    "description": company.description,
  })}</script>
</Head>
```

---

## 4. 実装優先順位

```
Phase 1（データ層）
  1. wp-schema.d.ts 再生成
  2. endpoints/persons.ts 新設
  3. endpoints/companies.ts 新設
  4. transform.ts 追加
  5. route.ts 追加

Phase 2（ページ）
  6. pages/person/[slug].tsx
  7. PersonTemplate コンポーネント
  8. pages/company/[slug].tsx
  9. CompanyTemplate コンポーネント
  10. Breadcrumb 対応
  11. SEO（Head / JSON-LD）
```

---

## 5. 保留事項

| 項目 | 理由 |
|---|---|
| `actors_filed_N_actor` 203件 term_id のまま | 手動対応待ち |
| `production_studio` / `film_studio` 空のpost | 手動入力中 |
| WPGraphQL for ACF 採用判断 | ACF logout bug 解消後に再検討 |
| person / company ページの内部リンクハブ化 | Phase 3 以降 |
