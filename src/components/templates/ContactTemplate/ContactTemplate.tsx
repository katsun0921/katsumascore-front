import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { Container } from '@/components/ui-layout/Container';
import { PageLayout } from '@/components/templates/PageLayout';
import { CONTACT_FORM_EMBED_SRC, CONTACT_FORM_VIEW_URL } from '@/config/contact.config';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';

export const ContactTemplate = () => {
  const locale = useLocale();

  const breadcrumbItems = [
    { label: t(messages, ['breadcrumb', 'home'], locale), href: '/' },
    { label: t(messages, ['hero', 'title'], locale) },
  ];

  return (
    <PageLayout>
      <div className='bg-secondary'>
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

      <div className='bg-color-bg px-4 py-8 pb-12'>
        <Container className='space-y-6'>
          <p className='text-sm text-color-secondary leading-relaxed'>
            {t(messages, ['body', 'lead'], locale)}
          </p>
          <p className='text-sm'>
            <a
              href={CONTACT_FORM_VIEW_URL}
              target='_blank'
              rel='noreferrer noopener'
              className='text-color-primary underline underline-offset-2'
            >
              {t(messages, ['form', 'openExternally'], locale)}
            </a>
          </p>
          <div className='w-full overflow-hidden rounded-sm border border-color-border bg-color-bg'>
            <iframe
              title={t(messages, ['form', 'iframeTitle'], locale)}
              src={CONTACT_FORM_EMBED_SRC}
              className='block w-full min-h-96 border-0'
            />
          </div>
        </Container>
      </div>
    </PageLayout>
  );
};
