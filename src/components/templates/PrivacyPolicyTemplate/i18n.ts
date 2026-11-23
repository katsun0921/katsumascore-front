export const messages = {
  breadcrumb: {
    home: { ja: 'ホーム', en: 'Home' },
  },
  hero: {
    kicker: { ja: 'インフォメーション', en: 'Information' },
    title: { ja: 'プライバシーポリシー', en: 'Privacy Policy' },
  },
  toc: {
    title: { ja: 'タイトル一覧', en: 'On this page' },
  },
  sections: {
    usage: {
      title: { ja: '個人情報の利用目的について', en: 'Purpose of personal information' },
      body: {
        ja: '当サイトにおける、電子メールにおけるお問い合わせの際に、お名前、メールアドレスなどの個人情報をご登録いただく場合がございます。これらの個人情報は、質問に対する回答や必要な情報を電子メールにおいて、当サイトからご回答やご連絡する場合に限定的に利用させていただく可能性のあるものです。個人情報をご提供いただく際の目的以外では利用いたしません。',
        en: 'When you contact us by email, you may provide personal information such as your name and email address. Such information may be used only to respond to your inquiry or to contact you by email when necessary. We will not use it for any purpose other than that for which it was provided.',
      },
    },
    disclosure: {
      title: { ja: '個人情報の第三者への開示について', en: 'Disclosure of personal information to third parties' },
      intro: {
        ja: '当サイトでは、ユーザーから頂戴した個人情報は適切に管理し、保護いたします。以下に該当する場合を除いてそれらの情報を勝手に第三者に開示することはありません。',
        en: 'We handle personal information you provide with care. We will not disclose it to third parties without your consent, except in the cases below.',
      },
      listItem1: {
        ja: '本人のご了承がある場合',
        en: 'When you have given your consent',
      },
      listItem2: {
        ja: '法令等への協力のため、開示が必要となる場合',
        en: 'When disclosure is required to comply with laws or regulations',
      },
    },
    analytics: {
      title: { ja: 'アクセス解析ツールについて', en: 'Analytics tools' },
      p1: {
        ja: '当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。',
        en: 'This site uses Google Analytics, a web analytics service provided by Google.',
      },
      p2: {
        ja: 'このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することができますので、お使いのブラウザの設定をご確認ください。',
        en: 'Google Analytics uses cookies to collect traffic data. This data is collected anonymously and is not used to identify individuals. You can refuse collection by disabling cookies in your browser settings.',
      },
      p3BeforeLink: {
        ja: 'この規約に関して、詳しくは',
        en: 'For more details, please see ',
      },
      linkLabel: {
        ja: 'こちら',
        en: 'Google’s Privacy Policy',
      },
      p3AfterLink: {
        ja: 'をご確認ください。',
        en: '.',
      },
    },
    chat: {
      title: { ja: 'AIチャット「サヨ」について', en: 'About the AI chat “Sayo”' },
      intro: {
        ja: '「サヨ」は、KatsumaScoreの記事をもとに作品をご案内するAIのキャラクターです。架空の人物で、実在の人物ではありません。',
        en: '“Sayo” is an AI character that guides you to works based on KatsumaScore articles. She is a fictional character, not a real person.',
      },
      handlingTitle: { ja: '入力された内容の扱い', en: 'How we handle what you enter' },
      handlingItem1: {
        ja: 'チャットに入力された質問は、回答を作るために、Cloudflare社のサービス（AI Gateway）を経由して、外部のAIサービス（Anthropic社のAPI）に送られます。会話の流れをふまえた回答を作るとき、新しい質問とあわせて、直前の質問と回答（同じキャラクターとの直近3往復までのうち、一定の字数に収まり、条件を満たすもの）も送られます。該当する記事がない、利用回数の上限に達した、といった理由で、送る前に止まる場合は、Anthropic社には何も送られません。一方、回答の作成を始めたあとにエラーや時間切れで回答が表示されなかった場合でも、質問や履歴は、Anthropic社に届いていることがあります。送る内容の長さを事前に数えるため、Anthropic社の長さを数える機能にも、同じ内容を送ります。',
        en: 'Your questions are sent, via Cloudflare’s service (AI Gateway), to an external AI service (Anthropic’s API) to generate answers. When we generate an answer that follows the flow of the conversation, your previous questions and answers (up to the last three exchanges with the same character, within a character limit and only those that meet our conditions) are sent together with the new question. If processing stops before sending (for example, no matching article was found or you reached the usage limit), nothing is sent to Anthropic. However, if an error or timeout occurs after we start generating an answer and no answer is displayed, your question and the history may still have reached Anthropic. To count the length of what we send in advance, the same content is also sent to Anthropic’s token-counting feature.',
      },
      handlingItem2: {
        ja: 'Anthropic社は、同社の規約により、API経由で送られた内容を、原則として30日以内に削除し、既定ではAIの学習に使わないとしています。ただし、Anthropic社の自動システムが利用ポリシー違反として検知した場合、入力と出力は最長2年間保持されることがあります。',
        en: 'According to Anthropic’s terms, content sent through its API is generally deleted within 30 days and is not used to train its AI models by default. However, if Anthropic’s automated systems flag content as a usage policy violation, the inputs and outputs may be retained for up to two years.',
      },
      handlingItem3: {
        ja: '記事を探すために、質問の文字列をCloudflare社のサービス（Workers AI）にも送ります。Cloudflare社は、これを通常は保持せず、AIの学習にも使わないとしています。',
        en: 'To find articles, the text of your question is also sent to Cloudflare’s service (Workers AI). Cloudflare states that it does not normally retain this content and does not use it to train AI models.',
      },
      handlingItem4: {
        ja: '会話を続けるために、会話履歴（質問と回答の本文）を、当サイトのサーバー（Cloudflare社のサービス上）に一時的に保存します。この会話履歴は、チャットの利用を始めたとき（セッションの開始）から24時間で削除します。使うたびに延長はされません。会話履歴は、キャラクターごとに直近3往復までで、それより前の往復は消えます。回答の生成と記録が最後まで終わらなかった往復は、会話履歴に保存しません。Cloudflare社の機能により、削除したあとも、過去30日以内の時点に復元できる場合があります。',
        en: 'To continue a conversation, we temporarily store the conversation history (the text of your questions and answers) on our server, which runs on Cloudflare’s services. This history is deleted 24 hours after your session starts, that is, when you begin using the chat. The 24 hours are not extended by further use. The history keeps up to the last three exchanges per character; earlier exchanges are removed. Exchanges that were not completed and recorded are not stored in the history. Using a Cloudflare feature, data may be restorable to a point within the past 30 days, even after deletion.',
      },
      handlingItem5: {
        ja: '利用状況の確認のために、回答ごとの費用・トークン数・所要時間・使用したブラウザの種類（ユーザーエージェント）などと、どのキャラクターと人格の版で答えたかの識別情報などを、Cloudflare社のサービス上に記録します。この記録は、Cloudflare社の設定に従って保持します。質問と回答の本文は、この記録には入れません。',
        en: 'To monitor usage, we record, on Cloudflare’s services, items such as the cost, token count and duration of each answer, the type of browser (user agent), and identifiers of which character and persona version answered. These records are kept under Cloudflare’s settings. The text of your questions and answers is not included in these records.',
      },
      handlingItem6: {
        ja: '質問と回答を、AIの学習や評価のために自動で保存・利用することはありません。',
        en: 'We do not automatically save or use your questions and answers to train or evaluate AI.',
      },
      handlingItem7: {
        ja: 'チャットの質問と回答の本文を、アクセス解析（Googleアナリティクス）へ送ることはありません。',
        en: 'We do not send the text of your chat questions or answers to analytics (Google Analytics).',
      },
      personalTitle: { ja: '個人情報について', en: 'Personal information' },
      personalItem1: {
        ja: '氏名・メールアドレス・電話番号・住所など、個人を特定できる情報は入力しないでください。',
        en: 'Please do not enter information that can identify you, such as your name, email address, phone number, or address.',
      },
      personalItem2: {
        ja: '当サイトは、チャットのために、お名前やメールアドレスを集めません。',
        en: 'We do not collect your name or email address for the chat.',
      },
      limitsTitle: { ja: '利用回数の制限と不正利用の防止', en: 'Usage limits and abuse prevention' },
      limitsItem1: {
        ja: '利用回数を制限し、会話を続けるために、署名付きのCookie（24時間）を使います。広告や分析には使いません。',
        en: 'We use a signed cookie (24 hours) to limit usage and to continue a conversation. It is not used for advertising or analytics.',
      },
      limitsItem2: {
        ja: 'IPアドレスは、そのまま保存せず、元に戻せない形（ハッシュ）に変えて、その日の利用回数を数えるためだけに使います（限定公開の期間は、合言葉の入力の回数を数えるためにも使います）。利用の記録は、利用枠を確保した時点から24時間保持します。限定公開の合言葉の入力の回数は、日本時間の日付が変わるまで保持します。',
        en: 'We do not store your IP address as is. We convert it into an irreversible form (a hash) and use it only to count your daily usage (during the limited release, also to count passphrase entries). Usage records are kept for 24 hours from the time the usage slot is reserved, and, during the limited release, the count of passphrase entries until the date changes (Japan time).',
      },
      limitsItem3: {
        ja: '自動プログラムによる利用を防ぐために、Cloudflare社のTurnstileを使います。その確認のために、IPアドレスやブラウザの情報などが、Cloudflare社に送られ、ボットの検知・ブロックのために処理されます。Cloudflare社は、取得したシグナルを検知の精度の改善にも使います。保持期間は、公開されていません。',
        en: 'To prevent use by automated programs, we use Cloudflare Turnstile. For this check, your IP address, browser information and similar data are sent to Cloudflare and processed to detect and block bots. Cloudflare also uses the signals it collects to improve detection accuracy. The retention period is not publicly stated.',
      },
      answersTitle: { ja: '回答について', en: 'About the answers' },
      answersItem1: {
        ja: '回答はAIが作るもので、内容や配信状況は誤っている場合があります。最新の情報は、各サービスでご確認ください。',
        en: 'Answers are generated by AI, and the content and streaming availability may be incorrect. Please check the latest information on each service.',
      },
    },
    copyright: {
      title: { ja: '著作権について', en: 'Copyright' },
      p1: {
        ja: '当サイトの記事について、著作権は放棄しておりません。当サイトに存在する、文章・画像・動画等の著作物の情報を無断転載することを禁止します。引用の範囲を超えるものについては、法的処置を行います。',
        en: 'We do not waive copyright on articles on this site. Unauthorized reproduction of text, images, videos, or other works is prohibited. We may take legal action for use beyond fair quotation.',
      },
      p2BeforeLink: {
        ja: '転載を希望される方は、「',
        en: 'If you wish to republish content, please reach out via our ',
      },
      contactLink: {
        ja: 'お問い合わせ',
        en: 'contact page',
      },
      p2AfterLink: {
        ja: '」よりご連絡をお願いします。',
        en: '.',
      },
      p3: {
        ja: '当サイトは著作権の侵害を目的とするものではありません。使用している版権物の知的所有権はそれぞれの著作者・団体に帰属しております。著作権や肖像権に関して問題がありましたら御連絡ください。著作権所有者様からの警告及び修正・撤去のご連絡があった場合は迅速に対処または削除致します。',
        en: 'This site is not intended to infringe copyright. Intellectual property rights in third-party materials belong to their respective owners. If you have concerns about copyright or portrait rights, please contact us. We will respond promptly to requests from rights holders to correct or remove content.',
      },
    },
    disclaimer: {
      title: { ja: '免責事項', en: 'Disclaimer' },
      p1: {
        ja: '当サイトに掲載しているコンテンツの肖像権及び著作権は、各権利所有者に属します。',
        en: 'Portrait rights and copyrights in content on this site belong to their respective rights holders.',
      },
      p2: {
        ja: '当サイトからリンクおよびバナーなどによって、他のサイトに移動された場合において、リンク先のサイトで提供される情報およびサービス、それに準ずるものについて、当サイトは一切の責任を負いません。',
        en: 'We are not responsible for any information or services on external sites you reach via links or banners from this site.',
      },
      p3BeforeLink: {
        ja: '当サイトのコンテンツおよび情報については、可能な限り正確な情報を掲載するよう努めておりますが、誤情報である場合や、お客様が閲覧した時点ですでに情報が古くなっていることもございます。その場合は',
        en: 'We strive to keep content accurate, but information may be incorrect or outdated by the time you view it. In that case, please contact us via our ',
      },
      contactFormLink: {
        ja: 'お問い合わせフォーム',
        en: 'contact form',
      },
      p3AfterLink: {
        ja: 'よりご連絡ください。',
        en: '.',
      },
      p4: {
        ja: '当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねます。あらかじめご了承ください。',
        en: 'We accept no liability for any damage arising from use of this site’s content. Please be aware of this in advance.',
      },
    },
    links: {
      title: { ja: '当サイトのリンクについて', en: 'Links to this site' },
      body: {
        ja: '当サイトは基本的にリンクフリーですが、画像への直リンクや、インラインフレームの使用はお断りいたします。',
        en: 'You are generally free to link to this site; however, direct linking to images and use in inline frames are not permitted.',
      },
    },
  },
  meta: {
    title: { ja: 'プライバシーポリシー | KatsumaScore', en: 'Privacy Policy | KatsumaScore' },
    description: {
      ja: 'KatsumaScore の個人情報の取り扱い、アクセス解析、著作権、免責事項、リンクに関する方針を掲載しています。',
      en: 'KatsumaScore privacy policy: personal data, analytics, copyright, disclaimer, and linking.',
    },
  },
} as const;
