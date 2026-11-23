import { useDevChoice } from '@/hooks/useDevChoice';
import { devToolsStore } from '@/libs/devtools';
import { DevToolsChoice } from '@/components/features/devtools/DevToolsChoice';
import type { DevToolsChoiceOption } from '@/components/features/devtools/DevToolsChoice';
import {
  SAYO_API_MODE_ENABLED,
  SAYO_DATA_SOURCES,
  SAYO_DEV_KEYS,
  SAYO_MOCK_SCENARIOS,
  SAYO_MOCK_SCENARIO_IDS,
} from '@/components/features/sayo/mocks/sayoMockScenarios';
import type { SayoDataSource, SayoMockScenarioId } from '@/components/features/sayo/mocks/sayoMockScenarios';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

/** ローカルの開発サーバーか（ここからはai-chatのOriginチェックで実APIに届かない） */
const isLocalHost = (): boolean => typeof window !== 'undefined' && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

/**
 * 開発者ツールのサヨ用パネル。データ源（UI確認のmock／API疎通確認）と、UI確認のシナリオを選ぶ。
 * 選んだ設定は `useSayoClient` が読む。既定は mock（通信せず料金がかからない）
 */
export const SayoDevPanel = () => {
  const locale = useLocale();
  const [source, setSource] = useDevChoice<SayoDataSource>(SAYO_DEV_KEYS.dataSource, SAYO_DATA_SOURCES, 'mock');
  const [scenario, setScenario] = useDevChoice<SayoMockScenarioId>(SAYO_DEV_KEYS.scenario, SAYO_MOCK_SCENARIO_IDS, 'normal');

  const sourceOptions: DevToolsChoiceOption<SayoDataSource>[] = [
    { value: 'mock', label: t(messages, ['dataSource', 'mock'], locale), description: t(messages, ['dataSource', 'mockDesc'], locale) },
    {
      value: 'api',
      label: t(messages, ['dataSource', 'api'], locale),
      description: t(messages, ['dataSource', 'apiDesc'], locale),
      disabled: !SAYO_API_MODE_ENABLED,
      disabledReason: t(messages, ['dataSource', 'apiUnavailable'], locale),
    },
  ];
  const scenarioOptions: DevToolsChoiceOption<SayoMockScenarioId>[] = SAYO_MOCK_SCENARIO_IDS.map((id) => ({
    value: id,
    label: SAYO_MOCK_SCENARIOS[id].label,
    description: SAYO_MOCK_SCENARIOS[id].description,
  }));

  const reset = () => {
    devToolsStore.reset(Object.values(SAYO_DEV_KEYS));
    window.location.reload();
  };

  return (
    <div data-component='SayoDevPanel' className='sayoDevPanel'>
      <p className={`sayoDevPanel__status sayoDevPanel__status--${source}`} role='status'>{t(messages, ['status', source], locale)}</p>
      <DevToolsChoice legend={t(messages, ['dataSource', 'legend'], locale)} name='sayo-data-source' value={source} options={sourceOptions} onChange={setSource} />
      {source === 'api' && isLocalHost() && <p className='sayoDevPanel__warn'>{t(messages, ['localWarning'], locale)}</p>}
      {source === 'mock' && (
        <DevToolsChoice display='select' legend={t(messages, ['scenario', 'legend'], locale)} name='sayo-scenario' value={scenario} options={scenarioOptions} onChange={setScenario} />
      )}
      <p className='sayoDevPanel__note'>{t(messages, ['reloadNote'], locale)}</p>
      <button type='button' className='sayoDevPanel__reset' onClick={reset}>{t(messages, ['reset'], locale)}</button>
    </div>
  );
};
