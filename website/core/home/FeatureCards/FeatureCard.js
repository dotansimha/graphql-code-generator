const React = require('react')

const FeatureCard = (props) => (
  <div className="FeatureCard">
    <object data={props.iconSrc} type="image/svg+xml" width="200" height="200" />
    <div className="FeatureCard-description">{props.description}</div>
  </div>
)

module.exports = FeatureCard
