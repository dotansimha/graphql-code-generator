import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/tabs';
import { MDXTabsCurrentTabContext } from 'components/MDXTabsCurrentTabContext';
import React, { Children, createContext, ReactNode, useCallback, useContext, useState } from 'react';

// fetch active tabIndex across all instances of <MDXTabs> sharing the same namespace
const useCurrentTab = (namespace: string): [number, (i: number) => void] => {
  const { value, update } = useContext(MDXTabsCurrentTabContext);

  const setTab = useCallback(
    (i: number) => {
      update(namespace, i);
    },
    [namespace, update]
  );

  return [value[namespace], setTab];
};

interface MDXTabCurrentTabsContext {
  value: string[];
  addTab: (value: string) => void;
}

export const MDXTabCurrentTabsContext = createContext<MDXTabCurrentTabsContext>({
  value: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addTab: () => {},
});
const MDXTabsCurrentTabsContextProvider: React.FunctionComponent = ({ children }) => {
  const [value, updateValue] = useState<string[]>([]);

  const addTab = useCallback(
    (tab: string) => {
      updateValue(prev => [...prev, tab]);
    },
    [updateValue]
  );

  return <MDXTabCurrentTabsContext.Provider value={{ value, addTab }}>{children}</MDXTabCurrentTabsContext.Provider>;
};

const MDXTabsRenderer = ({ children, namespace }: { namespace: string; children: ReactNode }) => {
  const [index, setTabIndex] = useCurrentTab(namespace);
  const { value: tabs } = useContext(MDXTabCurrentTabsContext);

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
/**
 * Tab component that can contain MDX markup (ex: code snippet)
 *
 * @component
 * @example
 * <MDXTabs namespace={`a namespace for tabs that share same tabs type`}>
 *
 * <MDXTab label="Apollo Server">
 *
 * Apollo code example here
 *
 * </MDXTab>
 *
 *
 * <MDXTab label="Yoga Server">
 *
 * Yoga code example here
 *
 * </MDXTab>
 *
 * </MDXTabs>
 * )
 */
const MDXTabs = ({ children, namespace }: { namespace: string; children: ReactNode }) => (
  <MDXTabsCurrentTabsContextProvider>
    <MDXTabsRenderer namespace={namespace}>{children}</MDXTabsRenderer>
  </MDXTabsCurrentTabsContextProvider>
);

export default MDXTabs;
