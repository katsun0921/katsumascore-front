import Link from 'next/link';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { Container } from '@/components/ui-layout/Container';
import { PageLayout } from '@/components/templates/PageLayout';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

const SECTION_IDS = ['usage', 'disclosure', 'analytics', 'copyright', 'disclaimer', 'links'] as const;

export const PrivacyPolicyTemplate = () => {
  const locale = useLocale();
  const analyticsPrivacyHref =
    locale === 'en' ? 'https://policies.google.com/privacy?hl=en' : 'https://policies.google.com/privacy?hl=ja';

  const breadcrumbItems = [
    { label: t(messages, ['breadcrumb', 'home'], locale), href: '/' },
    { label: t(messages, ['hero', 'title'], locale) },
  ];

  return (
    <PageLayout>
      <div data-component='PrivacyPolicyTemplate' className='bg-secondary'>
        <div className='px-4 pt-3 pb-0'>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        <section className='px-4 py-8 md:py-12'>
          <div className='space-y-2'>
            <p className='font-ui text-xs tracking-[0.2em] text-score-accent uppercase'>
              {t(messages, ['hero', 'kicker'], locale)}
            </p>
            <h1 className='font-bold text-color-inverse'>{t(messages, ['hero', 'title'], locale)}</h1>
          </div>
        </section>
      </div>

      <div data-component='PrivacyPolicyTemplate' className='bg-color-bg px-4 py-8 pb-12'>
        <Container className='max-w-3xl space-y-10'>
          <nav aria-label={t(messages, ['toc', 'title'], locale)} className='rounded-sm border border-color-border bg-color-bg p-4'>
            <p className='text-sm font-semibold text-color-primary'>{t(messages, ['toc', 'title'], locale)}</p>
            <ol className='mt-3 list-decimal space-y-2 pl-5 text-sm text-color-secondary'>
              {SECTION_IDS.map((id) => (
                <li key={id}>
                  <a href={`#section-${id}`} className='text-color-primary underline underline-offset-2'>
                    {t(messages, ['sections', id, 'title'], locale)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <section id='section-usage' className='scroll-mt-8 space-y-3'>
            <h2 className='text-lg font-semibold text-color-primary'>
              {t(messages, ['sections', 'usage', 'title'], locale)}
            </h2>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'usage', 'body'], locale)}</p>
          </section>

          <section id='section-disclosure' className='scroll-mt-8 space-y-3'>
            <h2 className='text-lg font-semibold text-color-primary'>
              {t(messages, ['sections', 'disclosure', 'title'], locale)}
            </h2>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'disclosure', 'intro'], locale)}</p>
            <ul className='list-disc space-y-2 pl-5 text-sm leading-relaxed text-color-secondary'>
              <li>{t(messages, ['sections', 'disclosure', 'listItem1'], locale)}</li>
              <li>{t(messages, ['sections', 'disclosure', 'listItem2'], locale)}</li>
            </ul>
          </section>

          <section id='section-analytics' className='scroll-mt-8 space-y-3'>
            <h2 className='text-lg font-semibold text-color-primary'>
              {t(messages, ['sections', 'analytics', 'title'], locale)}
            </h2>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'analytics', 'p1'], locale)}</p>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'analytics', 'p2'], locale)}</p>
            <p className='text-sm leading-relaxed text-color-secondary'>
              {t(messages, ['sections', 'analytics', 'p3BeforeLink'], locale)}
              <a
                href={analyticsPrivacyHref}
                target='_blank'
                rel='noreferrer noopener'
                className='text-color-primary underline underline-offset-2'
              >
                {t(messages, ['sections', 'analytics', 'linkLabel'], locale)}
              </a>
              {t(messages, ['sections', 'analytics', 'p3AfterLink'], locale)}
            </p>
          </section>

          <section id='section-copyright' className='scroll-mt-8 space-y-3'>
            <h2 className='text-lg font-semibold text-color-primary'>
              {t(messages, ['sections', 'copyright', 'title'], locale)}
            </h2>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'copyright', 'p1'], locale)}</p>
            <p className='text-sm leading-relaxed text-color-secondary'>
              {t(messages, ['sections', 'copyright', 'p2BeforeLink'], locale)}
              <Link href='/contact' className='text-color-primary underline underline-offset-2'>
                {t(messages, ['sections', 'copyright', 'contactLink'], locale)}
              </Link>
              {t(messages, ['sections', 'copyright', 'p2AfterLink'], locale)}
            </p>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'copyright', 'p3'], locale)}</p>
          </section>

          <section id='section-disclaimer' className='scroll-mt-8 space-y-3'>
            <h2 className='text-lg font-semibold text-color-primary'>
              {t(messages, ['sections', 'disclaimer', 'title'], locale)}
            </h2>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'disclaimer', 'p1'], locale)}</p>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'disclaimer', 'p2'], locale)}</p>
            <p className='text-sm leading-relaxed text-color-secondary'>
              {t(messages, ['sections', 'disclaimer', 'p3BeforeLink'], locale)}
              <Link href='/contact' className='text-color-primary underline underline-offset-2'>
                {t(messages, ['sections', 'disclaimer', 'contactFormLink'], locale)}
              </Link>
              {t(messages, ['sections', 'disclaimer', 'p3AfterLink'], locale)}
            </p>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'disclaimer', 'p4'], locale)}</p>
          </section>

          <section id='section-links' className='scroll-mt-8 space-y-3'>
            <h2 className='text-lg font-semibold text-color-primary'>
              {t(messages, ['sections', 'links', 'title'], locale)}
            </h2>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'links', 'body'], locale)}</p>
          </section>
        </Container>
      </div>
    </PageLayout>
  );
};
