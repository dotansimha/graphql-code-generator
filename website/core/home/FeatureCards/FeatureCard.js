const React = require('react')

const FeatureCard = (props) => (
  <div className="FeatureCard">
    <object className="FeatureCard-icon" data={props.iconSrc} type="image/svg+xml" width="200" height="200" />
    <div className="FeatureCard-title">{props.title}</div>
    <div className="FeatureCard-description">{props.description}</div>
  </div>
)

module.exports = FeatureCard
