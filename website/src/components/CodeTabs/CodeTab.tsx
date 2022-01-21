import React, { ReactNode, useContext, useEffect } from 'react';
import { CodeTabsTabContext } from './CodeTabs';

const CodeTabs = ({ children, label }: { label: string; children?: ReactNode }) => {
  const { addTab } = useContext(CodeTabsTabContext);

  useEffect(() => {
    addTab(label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};

export default CodeTabs;
