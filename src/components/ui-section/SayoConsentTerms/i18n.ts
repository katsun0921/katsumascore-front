export const messages = {
  summary: { ja: '利用規約を読む', en: 'Read the terms of use' },
  lead: {
    ja: 'サヨは、KatsumaScoreの記事をもとに作品を案内するAIです。はじめて使う前に、次の内容をご確認ください。',
    en: 'Sayo is an AI guide that answers from KatsumaScore reviews. Please review the following before your first use.',
  },
  points: {
    ai: {
      title: { ja: 'AIの回答について', en: 'About AI answers' },
      body: {
        ja: '回答はAIが自動で作ります。記事をもとにしていますが、誤りや不正確な内容を含むことがあります。作品の情報や配信状況は、記事や公式の情報でお確かめください。',
        en: 'Answers are generated automatically by AI. They are based on our reviews but may contain mistakes. Please check titles and streaming availability in the reviews or official sources.',
      },
    },
    send: {
      title: { ja: '入力した内容の送信', en: 'What is sent' },
      body: {
        ja: '入力した質問は、回答を作るために外部のAIサービスへ送られます。氏名・メールアドレス・電話番号・住所などの個人情報や、パスワードなどの秘密の値は入力しないでください。',
        en: 'Your questions are sent to an external AI service to generate answers. Do not enter personal information (name, email, phone, address) or secrets such as passwords.',
      },
    },
    keep: {
      title: { ja: '会話の保存', en: 'Conversation data' },
      body: {
        ja: '会話の本文は保存しません。続けて話せるよう、直近の数往復だけを最長24時間、一時的に保持します。利用回数の集計には、会話の本文を含めません。',
        en: 'We do not store your conversations. Only the last few turns are kept temporarily (up to 24 hours) so Sayo can follow the conversation. Usage counts do not include message text.',
      },
    },
    limit: {
      title: { ja: '利用回数', en: 'Daily limit' },
      body: {
        ja: '1日に使える回数に上限があります（要約・候補・会話の合計）。回数は日本時間の0時に戻ります。',
        en: 'There is a daily limit shared by summaries, suggestions and chat. It resets at midnight Japan time.',
      },
    },
    spoiler: {
      title: { ja: 'ネタバレ', en: 'Spoilers' },
      body: {
        ja: '結末などのネタバレは、作品名を挙げてはっきり求めたときだけ話します。',
        en: 'Sayo only reveals endings when you clearly ask for spoilers of a named title.',
      },
    },
    beta: {
      title: { ja: '限定公開のテスト', en: 'Limited beta' },
      body: {
        ja: 'いまは限定公開のテスト中です。予告なく内容を変えたり、受付を止めたりすることがあります。回答を参考にしたご判断は、ご自身の責任でお願いします。',
        en: 'This is a limited beta. Features may change or pause without notice. Please use the answers at your own discretion.',
      },
    },
    browser: {
      title: { ja: '同意の記録', en: 'Your consent' },
      body: {
        ja: '同意したことは、このブラウザにだけ記録します（質問や回答は記録しません）。ブラウザのデータを消したときや、規約を変えたときは、もう一度この画面を出します。',
        en: 'Your consent is saved only in this browser (no questions or answers). This screen appears again if you clear browser data or the terms change.',
      },
    },
  },
} as const;
