import Link from 'next/link'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'
import './AdBanner.scss'

// ── バナー型（A8.net 等のアフィリエイトHTMLを dangerouslySetInnerHTML で挿入）
type BannerVariant = {
  type: 'banner'
  bannerHtml: string
}

// ── CTAボタン型（テキストリンクボタン）
type CtaVariant = {
  type: 'cta'
  label: string
  url: string
  /** CSS変数経由のカラークラス名。例: 'var(--color-unext)' */
  color?: string
}

export type AdBannerProps = BannerVariant | CtaVariant

export const AdBanner = (props: AdBannerProps) => {
   
  const locale = useLocale()

  if (props.type === 'banner') {
    return (
      <div
        className='sidebar-ad sidebar-ad--banner'
        // アフィリエイトバナーHTMLをそのまま注入（A8.net 等の埋め込みコード）
        dangerouslySetInnerHTML={{ __html: props.bannerHtml }}
      />
    )
  }

  // type === 'cta'
  return (
    <div className='sidebar-ad sidebar-ad--cta'>
      <Link
        href={props.url}
        target='_blank'
        rel='noopener noreferrer'
        className='sidebar-ad__cta-button'
        style={props.color ? { backgroundColor: props.color } : undefined}
      >
        <span className='sidebar-ad__cta-label'>{props.label}</span>
        <span className='sidebar-ad__cta-arrow' aria-hidden='true'>
          {t(messages, ['cta', 'arrow'], locale)}
        </span>
      </Link>
    </div>
  )
}
