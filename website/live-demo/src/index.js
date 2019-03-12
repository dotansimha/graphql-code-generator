import 'any-observable/register/zen';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as jsYaml from 'js-yaml';

window.jsyaml = jsYaml;

process.stdout = process.stderr = {
  isTTY: false,
  write: () => null
};

ReactDOM.render(<App />, document.getElementById('root'));
