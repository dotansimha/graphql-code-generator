const React = require('react');

const IODemo = () => (
  <div className="IODemo">
    <iframe
      src={'http://localhost:3000/live-demo.html'}
      style={{
        width: '100vw',
        height: '350px'
      }}
    />
  </div>
);

module.exports = IODemo;
