import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-jp",
});

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-shippori-mincho",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${notoSansJP.variable} ${shipporiMincho.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}
