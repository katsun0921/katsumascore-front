const useRouter = () => ({
  push: (href: string) => { window.location.href = href; },
  replace: (href: string) => { window.location.href = href; },
  prefetch: () => Promise.resolve(),
  back: () => window.history.back(),
  pathname: '/',
  query: {},
  asPath: '/',
  locale: 'ja',
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
  isReady: true,
  isFallback: false,
});

const nextRouterMock = { useRouter };
export default nextRouterMock;
export { useRouter };
