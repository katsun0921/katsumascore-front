export const messages = {
  default: {
    paused: { ja: 'サヨはいま席を外しています。しばらくしてからお越しください。', en: 'Sayo is away right now. Please come back later.' },
    limit: { ja: '今日の会話はここまでです。明日（日本時間0時）にまたお話しできます。', en: 'That’s all for today. Sayo will be back tomorrow (midnight JST).' },
    notJoined: { ja: 'サヨとお話しするには、参加URLを開いて「参加する」を押してください。', en: 'To talk with Sayo, open your invitation link and press “Join”.' },
    closed: { ja: '本日の受付は終了しました。また明日お越しください。', en: 'Sayo has closed for today. Please come back tomorrow.' },
  },
  resume: { ja: '再開予定', en: 'Back' },
  stillOk: { ja: '要約と気分の候補ボタンは、このまま使えます。', en: 'Summaries and mood buttons still work.' },
} as const;
