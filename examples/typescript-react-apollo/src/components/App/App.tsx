import * as React from 'react';
import './App.css';

import logo from './logo.svg';
import { TestWithComponent } from '../TestWithComponent/TestWithComponent';
import { TestWithHOC } from '../TestWithHOC/TestWithHOC.container';
import { TestWithFragment } from '../TestWithFragment/TestWithFragment';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        <div>
          <strong>Example With Generated Component</strong>
          <TestWithComponent />
        </div>
        <div>
          <strong>Example With Generated HOC</strong>
          <TestWithHOC />
        </div>
        <div>
          <strong>Example With Generated Fragment</strong>
          <TestWithFragment />
        </div>
      </div>
    );
  }
}

export default App;
