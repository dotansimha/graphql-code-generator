import '@theguild/components/style.css';
import { AppProps } from 'next/app';
import localFont from 'next/font/local';
import Head from 'next/head';
import favicon from '../../public/favicon.svg';
import '../selection-styles.css';

const neueMontreal = localFont({
  src: [
    { path: '../fonts/PPNeueMontreal-Regular.woff2', weight: '400' },
    { path: '../fonts/PPNeueMontreal-Medium.woff2', weight: '500' },
  ],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href={favicon.src} />
      </Head>
      <style jsx global>{`
        :root {
          --font-sans: ${neueMontreal.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
