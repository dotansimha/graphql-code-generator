import { Editor } from './Editor';
import React from 'react';
import classes from './styles.module.css';
import classnames from 'classnames';
import { basename } from 'path';

export const CodegenOutput = ({ outputArray, editorProps, error }) => {
  const [index, setIndex] = React.useState(0);
  const editorContent = error ? error : outputArray && outputArray[index] ? outputArray[index].content : 'loading...';
  const isMultiple = outputArray && outputArray.length > 1 && !error;
  const titleBar = isMultiple ? (
    <div className={classes.tabsParent}>
      <div className={classes.iconText}>Output</div>
      <div className={classes.tabs}>
        {outputArray.map((outputItem, i) => (
          <div
            onClick={() => setIndex(i)}
            key={outputItem.filename}
            class={classnames({
              [classes.tab]: true,
              [classes.activeTab]: index === i,
            })}
          >
            {basename(outputItem.filename)}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className={classes.iconText}>Output</div>
  );

  return (
    <>
      <div className={classes.title}>{titleBar}</div>
      <Editor {...editorProps} value={editorContent} />
    </>
  );
};
