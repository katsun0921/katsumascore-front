/**
 * 開発者ツール（ローカル確認用）の型。docs/develop/dev_tools_box.md
 */
import type { ComponentType } from 'react';

/**
 * 開発者ツールに並べるパネル。1機能（サヨのデータ源、画面のABテストなど）につき1つ。
 * 足すときは、パネルのコンポーネントを作り、`DevToolsBox.config.ts` の一覧に1行足す
 */
export type DevToolsPanelDef = {
  /** パネルの識別子（設定キーの先頭にも使う。例: `sayo`、`ab`） */
  id: string;
  /** タブに出す名前 */
  title: string;
  Panel: ComponentType;
};
