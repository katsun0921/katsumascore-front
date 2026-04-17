export type StreamingVodLocale = 'ja' | 'en'

export type StreamingVodMessages = {
  defaultHeading: string
  headingPrefix: string
  headingSuffix: string
}

export const streamingVodConfig: Record<StreamingVodLocale, StreamingVodMessages> = {
  ja: {
    defaultHeading: '動画配信サービス',
    headingPrefix: '',
    headingSuffix: 'は、様々な動画配信サービスで配信中です。',
  },
  en: {
    defaultHeading: 'Streaming Services',
    headingPrefix: 'You can access ',
    headingSuffix: ' through various video distribution services.',
  },
}
