const React = require('react')

const siteConfig = require('../../../siteConfig')
const FeatureCard = require('./FeatureCard')

const FeatureCards = (props) => (
  <div className="FeatureCards">
    <FeatureCard iconSrc={`${siteConfig.baseUrl}img/gear.svg`} description="Generate code out of your GraphQL schema with a single function call regardless of your environment or code format" />
    <FeatureCard iconSrc={`${siteConfig.baseUrl}img/eye.svg`} description="Watch for changes in your GraphQL schema and automatically generate code as you go using a Webpack plug-in" />
    <FeatureCard iconSrc={`${siteConfig.baseUrl}img/puzzle.svg`} description="Pick one of our pre-defined code generating templates based on your needs or write one of your own using a boilerplate" />
  </div>
)

module.exports = FeatureCards
