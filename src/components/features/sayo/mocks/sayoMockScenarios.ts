/**
 * サヨのUI確認用シナリオ表。通信せず、あらかじめ決めた返答（架空の SayoClient）で画面の状態を再現する。
 * 開発者ツール（features/devtools/SayoDevPanel）の選択肢と、Storybook の再現条件の両方で使う。
 * シナリオを足すときは、ここに1行足す（開発者ツール側の変更は要らない）。
 */
import type { SayoMockOptions } from './sayoMockClient';

/** サヨの開発者ツール設定のキー（`devToolsStore` に保存する） */
export const SAYO_DEV_KEYS = {
  dataSource: 'sayo.dataSource',
  scenario: 'sayo.scenario',
} as const;

/**
 * データ源。mock＝UI確認（ai-chat へ通信せず、料金がかからない）／api＝API疎通確認（実際に ai-chat へ送る。回数・料金がかかる）
 */
export const SAYO_DATA_SOURCES = ['mock', 'api'] as const;
export type SayoDataSource = (typeof SAYO_DATA_SOURCES)[number];

/**
 * API疎通確認（`api`）を選べるか。**G10（本番での疎通確認）で true にする**（2026-11-23 決定）。
 * それまでは、開発者ツールに選択肢だけ出して無効にし、保存値が `api` でも mock に戻す。
 * true にする前提：本番の SayoClient（`src/libs/api/sayoChat.ts`。G4）ができていること、
 * ローカルから ai-chat へ届く経路が決まっていること（docs/develop/dev_tools_box.md 9章）
 */
export const SAYO_API_MODE_ENABLED = false;

export type SayoMockScenario = {
  label: string;
  /** 何を確かめるためのシナリオか（開発者ツールに出す） */
  description: string;
  options: SayoMockOptions;
};

/** UI確認用シナリオ。キーがシナリオID（保存される値） */
export const SAYO_MOCK_SCENARIOS = {
  normal: { label: '通常', description: '参加済み・残り30回。要約・候補・会話がそろって返る', options: {} },
  notJoined: { label: '未参加', description: 'GET /session が joined: false。要約・候補が無効になり、案内文が出る', options: { joined: false } },
  sessionError: { label: '参加確認の失敗', description: 'GET /session の通信失敗・503。未参加と同じ表示になる', options: { sessionFails: true } },
  lastOne: { label: '残り1回', description: '次の取得で残り0回になる。0回の直後の表示を確かめる', options: { remaining: 1 } },
  limitReached: { label: '残り0回', description: '回数を数える操作がすべて止まり、明日の案内が出る', options: { remaining: 0 } },
  paused: {
    label: '停止中（WP）',
    description: 'WordPress の停止フラグ ON。自由入力だけ止まり、要約・候補は使える',
    options: { status: { paused: true, message: '今月の会話の上限に達したため、サヨはお休み中です。12月1日から再開します。', resumeAt: '2026-12-01T00:00:00+09:00' } },
  },
  closed: { label: '受付終了（health）', description: 'health.enabled: false。自由入力だけ止まる', options: { healthEnabled: false } },
  hidden: { label: '非表示（WP）', description: 'WordPress の表示フラグ OFF。サヨのUIが何も出ない', options: { status: { visible: false } } },
  statusError: { label: '表示フラグの取得失敗', description: 'WordPress フラグの取得に失敗。出さない側に倒れる', options: { statusFails: true } },
  slow: { label: '遅い応答', description: '応答に数秒かかる。考え中の表示・二重送信の防止を確かめる', options: { delayMs: 1500 } },
  noMatch: { label: 'no_match', description: '会話が no_match（記事に該当なし）。表情は sorry', options: { forceMessageStatus: 'no_match' } },
  tooLong: { label: 'too_long', description: '会話が too_long（200字超）', options: { forceMessageStatus: 'too_long' } },
  limitUser: { label: 'limit_user', description: '会話が 429 limit_user。残り0回になる', options: { forceMessageStatus: 'limit_user' } },
  limitGlobal: { label: 'limit_global', description: '会話が 429 limit_global。サイト全体の上限', options: { forceMessageStatus: 'limit_global' } },
  sessionExpired: { label: 'session_expired', description: '会話が session_expired。参加URLの開き直しを案内する', options: { forceMessageStatus: 'session_expired' } },
  disabled: { label: 'disabled', description: '会話が 503 disabled。受付停止', options: { forceMessageStatus: 'disabled' } },
  error: { label: 'error', description: '会話が error。自動で再送しない', options: { forceMessageStatus: 'error' } },
} as const satisfies Record<string, SayoMockScenario>;

export type SayoMockScenarioId = keyof typeof SAYO_MOCK_SCENARIOS;

/** シナリオIDの一覧（選択肢・保存値の検証に使う） */
export const SAYO_MOCK_SCENARIO_IDS = Object.keys(SAYO_MOCK_SCENARIOS) as SayoMockScenarioId[];
