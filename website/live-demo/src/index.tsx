import 'any-observable/register/zen';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as jsYaml from 'js-yaml';

(window as any)['jsyaml'] = jsYaml;

(process as any)['stdout'] = (process as any)['stderr'] = {
  isTTY: undefined,
  write: () => false,
};

ReactDOM.render(<App />, document.getElementById('root'));
