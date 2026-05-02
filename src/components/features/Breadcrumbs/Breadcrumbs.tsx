import { Breadcrumb } from '@/components/ui-parts/Breadcrumb';
import { useLocale } from '@/i18n/provider';
import { t } from '@/i18n/t';
import type { Locale } from '@/i18n/t';
import type { PostType } from '@/libs/route';
import { messages } from './i18n';

export type BreadcrumbsProps = {
  title: string
  category?: string
  type?: PostType
  lang?: Locale
}

const getCategoryHref = (type: PostType, lang: Locale): string => {
  const prefix = lang === 'ja' ? '' : `/${lang}`;
  return `${prefix}/categories/${type}`;
};

export const Breadcrumbs = ({ title, category, type, lang }: BreadcrumbsProps) => {
  const locale = useLocale();
  const resolvedLang = lang ?? locale;
  const categoryHref = type ? getCategoryHref(type, resolvedLang) : undefined;

  const items = [
    { label: t(messages, ['breadcrumb', 'home'], locale), href: '/' },
    ...(category ? [{ label: category, href: categoryHref }] : []),
    { label: title },
  ];

  return <Breadcrumb items={items} />;
};
