import { FC } from 'react';
import { ThemeProvider, GlobalStyles, Header, FooterExtended } from '@theguild/components';

const Root: FC = ({ children }) => {
  return (
    <ThemeProvider>
      <GlobalStyles includeFonts />
      <Header themeSwitch activeLink="/open-source" accentColor="var(--ifm-color-primary)" />
      {children}
      <FooterExtended />
    </ThemeProvider>
  );
};

export default Root;
