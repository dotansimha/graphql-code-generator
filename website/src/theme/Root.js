import React from 'react';
import { ThemeProvider, Header } from '@theguild/components';

function Root({ children }) {
  return (
    <ThemeProvider>
      <Header themeSwitch activeLink={'/open-source'} accentColor="var(--ifm-color-primary)" />
      {children}
    </ThemeProvider>
  );
}

export default Root;
