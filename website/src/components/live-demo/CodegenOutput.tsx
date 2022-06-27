import { ReactElement, useEffect, useState } from 'react';

import Editor from './Editor';
import { basename } from 'path';
import classes from './styles.module.css';
import classnames from 'classnames';

const CodegenOutput = ({ outputArray, editorProps, error }): ReactElement => {
  const [index, setIndex] = useState(0);
  const editorContent = error || outputArray?.[index].content || '';

  useEffect(() => {
    setIndex(0);
  }, [outputArray]);

  return (
    <>
      <div className={classes.title}>
        <div className={classes.tabs}>
          {outputArray?.map((outputItem, i) => (
            <div
              onClick={() => setIndex(i)}
              key={outputItem.filename}
              className={classnames({
                [classes.tab]: true,
                [classes.activeTab]: index === i,
              })}
            >
              {basename(outputItem.filename)}
            </div>
          ))}
        </div>
      </div>
      <Editor {...editorProps} value={editorContent} />
    </>
  );
};

export default CodegenOutput;
