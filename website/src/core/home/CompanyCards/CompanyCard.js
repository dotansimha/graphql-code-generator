const React = require('react')

const CompanyCard = (props) => (
  <div className="CompanyCard">
    <object className="CompanyCard-icon" data={props.iconSrc} type="image/svg+xml" width={props.radius} height={props.radius} />
  </div>
)

module.exports = CompanyCard
