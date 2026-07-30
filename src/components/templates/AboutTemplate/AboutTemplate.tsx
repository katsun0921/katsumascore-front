import Link from 'next/link';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { Container } from '@/components/ui-layout/Container';
import { PageLayout } from '@/components/templates/PageLayout';
import { SITE_URL } from '@/libs/buildPostDetailFromWp/constants';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

const FACEBOOK_PAGE_HREF = 'https://www.facebook.com/people/Katsumascore/100072246676709/';

const SECTION_IDS = ['greeting', 'policy'] as const;

export const AboutTemplate = () => {
  const locale = useLocale();
  const siteUrl = SITE_URL.replace(/\/$/, '');

  const breadcrumbItems = [
    { label: t(messages, ['breadcrumb', 'home'], locale), href: '/' },
    { label: t(messages, ['hero', 'title'], locale) },
  ];

  return (
    <PageLayout>
      <div data-component='AboutTemplate' className='bg-secondary'>
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

      <div data-component='AboutTemplate' className='bg-color-bg px-4 py-8 pb-12'>
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

          <section id='section-greeting' className='scroll-mt-8 space-y-3'>
            <h2 className='text-lg font-semibold text-color-primary'>
              {t(messages, ['sections', 'greeting', 'title'], locale)}
            </h2>
            <p className='text-sm leading-relaxed text-color-secondary'>
              {t(messages, ['sections', 'greeting', 'p1BeforeStrong'], locale)}
              <strong>{t(messages, ['sections', 'greeting', 'p1Strong'], locale)}</strong>
              {t(messages, ['sections', 'greeting', 'p1AfterStrong'], locale)}
            </p>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'greeting', 'p2'], locale)}</p>
          </section>

          <section id='section-policy' className='scroll-mt-8 space-y-3'>
            <h2 className='text-lg font-semibold text-color-primary'>
              {t(messages, ['sections', 'policy', 'title'], locale)}
            </h2>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'policy', 'p1'], locale)}</p>
            <p className='text-sm leading-relaxed text-color-secondary'>
              {t(messages, ['sections', 'policy', 'p2BeforeStrong'], locale)}
              <strong>{t(messages, ['sections', 'policy', 'p2Strong'], locale)}</strong>
              {t(messages, ['sections', 'policy', 'p2AfterStrong'], locale)}
            </p>
            <p className='text-sm leading-relaxed text-color-secondary'>{t(messages, ['sections', 'policy', 'p3'], locale)}</p>
          </section>

          <div className='overflow-x-auto rounded-sm border border-color-border'>
            <table className='w-full min-w-[280px] border-collapse text-left text-sm text-color-secondary'>
              <caption className='border-b border-color-border bg-color-bg px-4 py-3 text-left text-sm font-semibold text-color-primary'>
                {t(messages, ['sections', 'table', 'caption'], locale)}
              </caption>
              <tbody>
                <tr className='border-b border-color-border'>
                  <th scope='row' className='w-[28%] align-top bg-color-bg px-4 py-3 font-medium text-color-primary'>
                    {t(messages, ['sections', 'table', 'operatorLabel'], locale)}
                  </th>
                  <td className='px-4 py-3 leading-relaxed'>{t(messages, ['sections', 'table', 'operatorValue'], locale)}</td>
                </tr>
                <tr className='border-b border-color-border'>
                  <th scope='row' className='align-top bg-color-bg px-4 py-3 font-medium text-color-primary'>
                    {t(messages, ['sections', 'table', 'siteUrlLabel'], locale)}
                  </th>
                  <td className='px-4 py-3'>
                    <a href={siteUrl} className='text-color-primary underline underline-offset-2' target='_blank' rel='noreferrer noopener'>
                      {siteUrl}
                    </a>
                  </td>
                </tr>
                <tr className='border-b border-color-border'>
                  <th scope='row' className='align-top bg-color-bg px-4 py-3 font-medium text-color-primary'>
                    {t(messages, ['sections', 'table', 'historyLabel'], locale)}
                  </th>
                  <td className='px-4 py-3'>{t(messages, ['sections', 'table', 'historyValue'], locale)}</td>
                </tr>
                <tr className='border-b border-color-border'>
                  <th scope='row' className='align-top bg-color-bg px-4 py-3 font-medium text-color-primary'>
                    {t(messages, ['sections', 'table', 'postCountLabel'], locale)}
                  </th>
                  <td className='px-4 py-3'>{t(messages, ['sections', 'table', 'postCountValue'], locale)}</td>
                </tr>
                <tr className='border-b border-color-border'>
                  <th scope='row' className='align-top bg-color-bg px-4 py-3 font-medium text-color-primary'>
                    {t(messages, ['sections', 'table', 'snsLabel'], locale)}
                  </th>
                  <td className='px-4 py-3 leading-relaxed'>
                    {t(messages, ['sections', 'table', 'snsBeforeLink'], locale)}
                    <a
                      href={FACEBOOK_PAGE_HREF}
                      target='_blank'
                      rel='noreferrer noopener'
                      className='text-color-primary underline underline-offset-2'
                    >
                      {t(messages, ['sections', 'table', 'snsLinkLabel'], locale)}
                    </a>
                    {t(messages, ['sections', 'table', 'snsAfterLink'], locale)}
                  </td>
                </tr>
                <tr>
                  <th scope='row' className='align-top bg-color-bg px-4 py-3 font-medium text-color-primary'>
                    {t(messages, ['sections', 'table', 'contactLabel'], locale)}
                  </th>
                  <td className='px-4 py-3 leading-relaxed'>
                    {t(messages, ['sections', 'table', 'contactBeforeLink'], locale)}
                    <Link href='/contact' className='text-color-primary underline underline-offset-2'>
                      {t(messages, ['sections', 'table', 'contactLinkLabel'], locale)}
                    </Link>
                    {t(messages, ['sections', 'table', 'contactMiddle'], locale)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </div>
    </PageLayout>
  );
};
