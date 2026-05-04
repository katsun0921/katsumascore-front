import '@/styles/globals.css';
import '@/styles/_app-component-styles.scss';
import type { AppProps } from 'next/app';
import { Noto_Sans_JP, Shippori_Mincho } from 'next/font/google';
import Script from 'next/script';
import { useRouter } from 'next/router';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

const shipporiMincho = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-heading',
});

/** 本番のみ読み込む GA4 測定 ID（`NEXT_PUBLIC_*` では持たない）。 */
const GA_MEASUREMENT_ID = 'G-NE4K3EM3VB';
/** AdSense のパブリッシャー ID（`adsbygoogle.js` の client）。 */
const ADSENSE_PUBLISHER_ID = 'ca-pub-6583700677059660';
const isProd = process.env.NODE_ENV === 'production';

const App = ({ Component, pageProps }: AppProps) => {
  const { locale } = useRouter();

  return (
    <main className={`${notoSansJP.variable} ${shipporiMincho.variable}`}>
      {isProd && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy='afterInteractive'
          />
          <Script id='google-analytics' strategy='afterInteractive'>{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
            gtag('set', { language: '${locale ?? 'ja'}' });
          `}</Script>
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
            strategy='afterInteractive'
            crossOrigin='anonymous'
          />
        </>
      )}
      <Component {...pageProps} />
    </main>
  );
};

export default App;
