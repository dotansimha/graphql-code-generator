import { createContext, useCallback, useState } from 'react';

interface Context {
  value: { [k: string]: number };
  update: (ns: string, value: number) => void;
}

export const CodeTabsContext = createContext<Context>({
  value: {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  update: () => {},
});

export const Provider: React.FunctionComponent = ({ children }) => {
  const [value, updateValue] = useState<{ [k: string]: number }>({});

  const update = useCallback(
    (ns: string, val: number) => {
      updateValue({
        ...value,
        [ns]: val,
      });
    },
    [updateValue, value]
  );

  return <CodeTabsContext.Provider value={{ value, update }}>{children}</CodeTabsContext.Provider>;
};
