export const messages = {
  status: {
    mock: { ja: '現在：UI確認（ai-chatへ通信しません・料金なし）', en: 'Now: UI check (no requests to ai-chat, free)' },
    api: { ja: '現在：API疎通確認（ai-chatへ実際に送ります・回数と料金がかかります）', en: 'Now: API check (sends real requests to ai-chat; uses quota and costs money)' },
  },
  dataSource: {
    legend: { ja: 'データ源', en: 'Data source' },
    mock: { ja: 'UI確認（mock）', en: 'UI check (mock)' },
    mockDesc: { ja: 'あらかじめ決めた返答を返します。ai-chatへは通信しないので、何度押しても料金はかかりません。', en: 'Returns canned replies. Never calls ai-chat, so it costs nothing.' },
    api: { ja: 'API疎通確認', en: 'API check' },
    apiDesc: { ja: '実際にai-chatへリクエストします。要約・候補・会話の1回ごとに、回数とLLMの料金がかかります。', en: 'Sends real requests to ai-chat. Each summary, suggestion or message uses quota and costs money.' },
    apiUnavailable: { ja: 'G10（本番での疎通確認）で有効にします。それまでは選べません', en: 'Not available yet: it will be enabled in G10 (production verification)' },
  },
  scenario: {
    legend: { ja: 'UI確認のシナリオ', en: 'UI check scenario' },
  },
  localWarning: {
    ja: 'ローカル（localhost）からは、Originが合わずai-chatに届きません（403）。ローカルから届く経路は、G10で有効にするときに決めます（docs/develop/dev_tools_box.md の9章）。',
    en: 'From localhost, ai-chat rejects the request (403, origin mismatch). The route to reach it locally will be decided when this is enabled in G10 (see docs/develop/dev_tools_box.md, section 9).',
  },
  reset: { ja: 'サヨの設定を初期値に戻す', en: 'Reset Sayo settings' },
  reloadNote: { ja: '変更するとページを再読み込みして反映します。', en: 'The page reloads to apply a change.' },
} as const;
