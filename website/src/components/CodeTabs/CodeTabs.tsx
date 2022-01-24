import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/tabs';
import { CodeTabsContext } from 'components/CodeTabsContext';
import React, { Children, createContext, ReactNode, useCallback, useContext, useState } from 'react';

const useCurrentTab = (namespace: string): [number, (i: number) => void] => {
  const { value, update } = useContext(CodeTabsContext);

  const setTab = useCallback(
    (i: number) => {
      update(namespace, i);
    },
    [namespace, update]
  );

  return [value[namespace], setTab];
};

interface CodeTabsTabContext {
  value: string[];
  addTab: (value: string) => void;
}

export const CodeTabsTabContext = createContext<CodeTabsTabContext>({
  value: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addTab: () => {},
});
const CodeTabsTabContextProvider: React.FunctionComponent = ({ children }) => {
  const [value, updateValue] = useState<string[]>([]);

  const addTab = useCallback(
    (tab: string) => {
      updateValue(prev => [...prev, tab]);
    },
    [updateValue]
  );

  return <CodeTabsTabContext.Provider value={{ value, addTab }}>{children}</CodeTabsTabContext.Provider>;
};

const CodeTabsRenderer = ({ children, namespace }: { namespace: string; children: ReactNode }) => {
  const [index, setTabIndex] = useCurrentTab(namespace);
  const { value: tabs } = useContext(CodeTabsTabContext);

  return (
    <Tabs
      width="100%"
      position="relative"
      shadow="md"
      borderWidth="1px"
      borderRadius="5px"
      index={index}
      marginY="1em"
      onChange={setTabIndex}
      whiteSpace="pre-wrap"
    >
      <TabList>
        {tabs.map(tab => (
          <Tab key={tab}>{tab}</Tab>
        ))}
      </TabList>
      <TabPanels>
        {Children.toArray(children).map((c, k) => (
          <TabPanel key={`tabpanel-${k}`}>{c}</TabPanel>
        ))}
      </TabPanels>
      {/* <CopyToClipboard value={currentContent} /> */}
    </Tabs>
  );
};

const CodeTabs = ({ children, namespace }: { namespace: string; children: ReactNode }) => (
  <CodeTabsTabContextProvider>
    <CodeTabsRenderer namespace={namespace}>{children}</CodeTabsRenderer>
  </CodeTabsTabContextProvider>
);

export default CodeTabs;
