/**
 * 開発者ツールに並べるパネルの一覧。この一覧が、箱に出るタブの正。
 * 機能を足すとき（例：画面のABテスト）は、パネルのコンポーネントを作り、ここへ1行足す。箱本体の変更は要らない。
 */
import type { DevToolsPanelDef } from '@/types/devtools';
import { SayoDevPanel } from '@/components/features/devtools/SayoDevPanel';

export const devToolsPanels: readonly DevToolsPanelDef[] = [
  { id: 'sayo', title: 'サヨ', Panel: SayoDevPanel },
];
