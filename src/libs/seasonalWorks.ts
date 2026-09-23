/**
 * 季節まとめ固定ページの本文 HTML から作品リストを抽出する（サーバー側想定）。
 *
 * CPT（`seasonal_review`）へ移行するまでのあいだ、まとめページの中身は
 * WordPress 固定ページの本文 HTML として入稿されている。本文は
 * `<h2><a>作品名</a></h2><p>あらすじ</p><details><summary>配信サービス</summary><ul><li>…</li></ul></details>`
 * の繰り返しという規則的な構造を持つため、ここで表示用のデータへ落とす。
 *
 * CPT 移行後は `normalizeSeasonalEntries` が同じ形（`SeasonalWork`）を返すようにし、
 * 一覧 UI 側はデータの出どころを知らないまま差し替えられるようにする。
 */
import { parseDocument } from 'htmlparser2';
import { textContent } from 'domutils';
import type { Element, ChildNode } from 'domhandler';
import { VOD_CONFIG, type VodService } from '@/config/vod.config';

/** まとめページに並ぶ作品1件分（表示用）。 */
export type SeasonalWork = {
  /** 絞り込み・key に使う安定した識別子。本文の見出し id（`heading-3`）か連番 */
  id: string;
  title: string;
  /** あらすじ（h2 直後の p）。未入力なら空文字 */
  summary: string;
  /** 公式サイト等へのリンク。見出しがリンクでなければ null */
  officialUrl: string | null;
  /** 配信サービス（表示用ラベル）。`配信サービス未発表` 等もそのまま持つ */
  vods: SeasonalWorkVod[];
};

/** 作品が視聴できる配信サービス1件分。 */
export type SeasonalWorkVod = {
  /** 入稿された表示ラベル（`ABEMA（独占）` など、注記を含む） */
  label: string;
  /** 絞り込みのキー。表記ゆれを吸収した正規化済みの名称（`ABEMA`） */
  key: string;
  /** ブランドカラーの CSS 変数。`VOD_CONFIG` に該当が無ければ null */
  colorVar: string | null;
  /** 配信予定が未発表であることを示す行か（絞り込み対象から外す） */
  isUndecided: boolean;
};

/**
 * 入稿ラベルから注記（`（独占）` `（世界独占）` など）を取り除く。
 * 同じサービスが注記違いで別項目として並ぶのを防ぐ。
 */
const stripNote = (label: string): string => label.replace(/[（(][^）)]*[）)]\s*$/, '').trim();

/**
 * 表記ゆれを正規化してサービス名を揃える。
 *
 * 入稿は手作業のため、同じサービスが `Amazon Prime Video` / `Prime Video`、
 * `ディズニープラス` / `Disney+` のように揺れる。絞り込みの選択肢が
 * 重複しないよう、代表表記へ寄せる。
 */
const VOD_ALIASES: Record<string, string> = {
  'amazon prime video': 'Prime Video',
  'prime video': 'Prime Video',
  'ディズニープラス': 'Disney+',
  'disney+': 'Disney+',
  'abemaプレミアム': 'ABEMA',
  abema: 'ABEMA',
  netflix: 'Netflix',
  hulu: 'Hulu',
  'u-next': 'U-NEXT',
  unext: 'U-NEXT',
  youtube: 'YouTube',
  'dアニメストア': 'dアニメストア',
};

/** `VOD_CONFIG` のラベルから、ブランドカラー変数を引くための逆引き表。 */
const COLOR_VAR_BY_LABEL = new Map<string, string>(
  (Object.keys(VOD_CONFIG) as VodService[]).map((service) => [
    VOD_CONFIG[service].label.toLowerCase(),
    VOD_CONFIG[service].colorVar,
  ]),
);

/**
 * 配信未定を表す行かどうかを判定する。
 * `配信サービス未発表`／`未発表（配信予定あり）`／`その他の配信サービス` は
 * 特定のサービスを指さないため、絞り込みの選択肢には出さない。
 */
const isUndecidedLabel = (label: string): boolean =>
  label.includes('未発表') || label.includes('未定') || label.startsWith('その他');

/** `<li>` のテキストを表示用の配信サービスへ正規化する。 */
const toVod = (rawLabel: string): SeasonalWorkVod | null => {
  const label = rawLabel.trim();
  if (label.length === 0) return null;

  const isUndecided = isUndecidedLabel(label);
  const base = stripNote(label);
  const key = VOD_ALIASES[base.toLowerCase()] ?? base;

  return {
    label,
    key,
    colorVar: COLOR_VAR_BY_LABEL.get(key.toLowerCase()) ?? null,
    isUndecided,
  };
};

/** 子ノードのうち最初の要素ノードを返す（テキストノードを読み飛ばす）。 */
const firstElement = (node: Element, name: string): Element | null => {
  const found = node.children.find(
    (child: ChildNode): child is Element => child.type === 'tag' && child.name === name,
  );
  return found ?? null;
};

/**
 * `<details>` 内の `<li>` を配信サービスの配列へ変換する。
 * `<ul>` が無い入稿もありうるため、`details` 配下の `li` を素直に拾う。
 */
const readVods = (details: Element): SeasonalWorkVod[] => {
  const vods: SeasonalWorkVod[] = [];
  const walk = (nodes: ChildNode[]) => {
    for (const node of nodes) {
      if (node.type !== 'tag') continue;
      const el = node as Element;
      if (el.name === 'li') {
        const vod = toVod(textContent(el));
        if (vod) vods.push(vod);
        continue;
      }
      walk(el.children);
    }
  };
  walk(details.children);
  return vods;
};

/**
 * 季節まとめ本文 HTML から作品リストを抽出する。
 *
 * `h2` を作品の区切りとし、次の `h2` が現れるまでに登場した最初の `p` を
 * あらすじ、`details` を配信サービスとして紐づける。`h2` を持たない本文
 * （移行前の別フォーマット等）では空配列を返すため、呼び出し側は
 * 従来どおり本文 HTML をそのまま描画するフォールバックを残せる。
 */
export const extractSeasonalWorks = (html: string): SeasonalWork[] => {
  const dom = parseDocument(html);
  const works: SeasonalWork[] = [];
  let current: SeasonalWork | undefined;

  const walk = (nodes: ChildNode[]) => {
    for (const node of nodes) {
      if (node.type !== 'tag') continue;
      const el = node as Element;

      if (el.name === 'h2') {
        const title = textContent(el).trim();
        if (title.length === 0) {
          current = undefined;
          continue;
        }
        const anchor = firstElement(el, 'a');
        current = {
          id: el.attribs?.id || `seasonal-work-${works.length}`,
          title,
          summary: '',
          officialUrl: anchor?.attribs?.href ?? null,
          vods: [],
        };
        works.push(current);
        continue;
      }

      if (!current) {
        // 最初の h2 より前（リード文など）は作品に属さないので読み飛ばす
        walk(el.children);
        continue;
      }

      if (el.name === 'p' && current.summary.length === 0) {
        current.summary = textContent(el).trim();
        continue;
      }

      if (el.name === 'details') {
        current.vods = readVods(el);
        continue;
      }

      walk(el.children);
    }
  };

  walk(dom.children);
  return works;
};

/**
 * 作品リストに登場する配信サービスを、出現数の多い順に並べて返す。
 *
 * 絞り込み UI の選択肢に使う。配信未定を表す行（`未発表` / `その他`）は
 * 絞り込んでも意味を持たないため除外する。
 */
export const collectVodFilters = (works: SeasonalWork[]): { key: string; count: number }[] => {
  const counts = new Map<string, number>();
  for (const work of works) {
    // 同一作品内で同じサービスが重複しても1件として数える
    const keys = new Set(work.vods.filter((v) => !v.isUndecided).map((v) => v.key));
    for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => (b.count === a.count ? a.key.localeCompare(b.key) : b.count - a.count));
};
