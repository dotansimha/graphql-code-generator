import React, { ReactNode, useContext, useEffect } from 'react';
import { MDXTabCurrentTabsContext } from './MDXTabs';

const MDXTab = ({ children, label }: { label: string; children?: ReactNode }) => {
  const { addTab } = useContext(MDXTabCurrentTabsContext);

  // register the tab in the tabs parent
  useEffect(() => {
    addTab(label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};

export default MDXTab;
