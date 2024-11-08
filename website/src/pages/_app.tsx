import '@theguild/components/style.css';
import { AppProps } from 'next/app';
import localFont from 'next/font/local';

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
      <style jsx global>{`
        :root {
          --font-sans: ${neueMontreal.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
