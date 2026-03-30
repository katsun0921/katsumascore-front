import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-heading",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${notoSansJP.variable} ${shipporiMincho.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}
