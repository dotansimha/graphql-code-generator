import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { ThemeProvider, Header } from 'the-guild-components';

// Default implementation, that you can customize
function Root({ children }) {
  return (
    <>
      <BrowserOnly>
        {() => (
          <ThemeProvider>
            <Header themeSwitch activeLink={'/open-source'} accentColor="var(--ifm-color-primary)" />
          </ThemeProvider>
        )}
      </BrowserOnly>
      {children}
    </>
  );
}

export default Root;
