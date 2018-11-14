const React = require('react');

const IODemo = () => (
  <div className="IODemo">
    <iframe
      src={'/live-demo/'}
      style={{
        width: '100vw',
        height: '350px'
      }}
    />
  </div>
);

module.exports = IODemo;
