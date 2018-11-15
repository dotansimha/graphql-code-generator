const React = require('react');

const IODemo = () => (
  <div className="IODemo">
    <iframe
      src={'http://localhost:3000'}
      style={{
        width: '100vw',
        height: '500px'
      }}
    />
  </div>
);

module.exports = IODemo;
