const React = require('react')

const siteConfig = require('../../../siteConfig')
const CompanyCard = require('./CompanyCard')

const CompanyCards = (props) => (
  <div className="CompanyCards">
    <div className="CompanyCards-details">
      <h4>COMPANIES</h4>
      <h3>Is enterprise proven</h3>
      <div>GraphQL Code Generator is not just a concept, it works, and has proven itself to integrate flawlessly with the demanding enviroments of various enterprise companies.</div>
    </div>
    <div className="CompanyCards-cards">
      <CompanyCard iconSrc={`${siteConfig.baseUrl}img/companies/schneider.svg`} radius="200" />
      <CompanyCard iconSrc={`${siteConfig.baseUrl}img/companies/klm.svg`} radius="200" />
      <CompanyCard iconSrc={`${siteConfig.baseUrl}img/companies/airfrance.svg`} radius="200" />
    </div>
  </div>
)

module.exports = CompanyCards

