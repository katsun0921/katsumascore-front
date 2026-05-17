// ISR: revalidate 86400s (24h)
import Image from 'next/image';
import { PageLayout } from '@/components/templates/PageLayout';
import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import { messages } from './i18n';
import type { Company } from '@/libs/api/wordpress/transform';

type CompanyTemplateProps = {
  company: Company;
  breadcrumbs: { label: string; href: string }[];
};

export const CompanyTemplate = ({ company, breadcrumbs }: CompanyTemplateProps) => {
  const locale = useLocale();
  const displayName = locale === 'en' ? company.nameEn : company.nameJa;
  const altName = locale === 'en' ? company.nameJa : company.nameEn;

  return (
    <PageLayout>
      <div className='mx-auto max-w-screen-lg px-4 py-6'>
        <Breadcrumb items={breadcrumbs} />
        <article className='mt-6'>
          <div className='flex flex-col gap-6 lg:flex-row'>
            {company.logo && (
              <div className='shrink-0'>
                <Image
                  src={company.logo.url}
                  alt={company.logo.alt}
                  width={200}
                  height={120}
                  className='object-contain'
                />
              </div>
            )}
            <div className='flex flex-col gap-4'>
              <h1 className='text-2xl font-bold'>{displayName}</h1>
              {altName && <p className='text-sm text-[var(--color-text-muted)]'>{altName}</p>}
              {company.roles.length > 0 && (
                <ul className='flex gap-2'>
                  {company.roles.map((role) => (
                    <li
                      key={role}
                      className='rounded px-2 py-1 text-xs bg-[var(--color-surface-2)]'
                    >
                      {t(messages, ['role', role], locale)}
                    </li>
                  ))}
                </ul>
              )}
              {company.description && (
                <p className='leading-relaxed'>{company.description}</p>
              )}
            </div>
          </div>
        </article>
      </div>
    </PageLayout>
  );
};
