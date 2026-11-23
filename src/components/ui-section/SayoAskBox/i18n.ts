export const messages = {
  title: {
    all: { ja: '何を観ようか迷ったら', en: 'Not sure what to watch?' },
    scoped: { ja: 'の中から、何を観ようか迷ったら', en: ': not sure what to watch?' },
  },
  subtitle: { ja: 'サヨ ／ AI映画店主が、KatsumaScoreの記事から探します', en: 'Sayo, our AI shopkeeper, searches KatsumaScore reviews' },
  form: {
    label: { ja: 'サヨに探してほしい作品', en: 'What should Sayo look for?' },
    placeholder: { ja: '気分や好みを自由に（例：雨の日に観たい）', en: 'Describe your mood (e.g. something for a rainy day)' },
    submit: { ja: '探す', en: 'Search' },
  },
  hint: {
    ja: '候補ボタンは記事のタグから、自由入力はAIが探します（どちらも1回ずつ数えます）。カード右上の「要約」からは、作品ごとの要約を聞けます（これも1回数えます）。',
    en: 'Mood buttons search by review tags and free text is searched by AI (each counts once). Use “Summary” on each card for a quick summary (also counts once).',
  },
} as const;
