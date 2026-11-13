export const messages = {
  close: { ja: '閉じる', en: 'Close' },
  prev: { ja: '前の作品', en: 'Previous' },
  next: { ja: '次の作品', en: 'Next' },
  backToResults: { ja: '結果に戻る', en: 'Back to results' },
  read: { ja: 'レビューを読む', en: 'Read review' },
  note: {
    ja: 'AIの回答です。要約はKatsumaScoreの記事をもとに作成し、編集部が確認しています。個人情報は入力しないでください。',
    en: 'AI-generated. Summaries are based on KatsumaScore reviews and checked by our editors. Do not enter personal information.',
  },
  searchHead: {
    label: { ja: 'サヨと探す', en: 'Search with Sayo' },
    all: { ja: 'すべての記事から', en: 'All reviews' },
    scoped: { ja: 'の記事から', en: ' reviews' },
  },
  deep: {
    postSuffix: { ja: 'を詳しく知りたい', en: ': tell me more' },
    postSub: { ja: '見どころ・惜しいところ・似た作品・結末まで、サヨと話しながら聞けます（ここから先はAIとの会話です）', en: 'Ask Sayo about highlights, weak points, similar titles and the ending (AI chat from here).' },
    search: { ja: '詳しく知りたい', en: 'Tell me more' },
    searchSub: { ja: '選んだ作品の話を、サヨの映画店でゆっくり聞けます。ほかの気分で探し直すこともできます', en: 'Talk with Sayo about these picks, or try another mood.' },
  },
  others: { ja: 'ほかの気分で探す', en: 'Try another mood' },
  error: { ja: '返事を受け取れませんでした。時間をおいて、もう一度お試しください。', en: 'Could not get a reply. Please try again later.' },
  loading: { ja: '読み込み中', en: 'Loading' },
} as const;
