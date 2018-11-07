const React = require('react')

const siteConfig = require('../../../siteConfig')
const FeatureCard = require('./FeatureCard')

const FeatureCards = (props) => (
  <div className="FeatureCards">
    <div className="FeatureCards-details">
      <h4>FEATURES</h4>
      <h3>What you can get from our code generator</h3>
      <div>We collected and distilled the knowledge of several experienced Code Generator up there and improve it for professionals use that generate Graph QL schema definitions to turn generate to full functionality.</div>
    </div>
    <div className="FeatureCards-cards">
      <FeatureCard iconSrc={`${siteConfig.baseUrl}img/gear.svg`} title="Generate Code Instantly" description="Generate code out of your GraphQL schema with a single function call regardless of your environment or code format" />
      <FeatureCard iconSrc={`${siteConfig.baseUrl}img/eye.svg`} title="Watch for Changes" description="Watch for changes in your GraphQL schema and automatically generate code as you go using a Webpack plug-in" />
      <FeatureCard iconSrc={`${siteConfig.baseUrl}img/puzzle.svg`} title="Use Right Away" description="Pick one of our pre-defined code generating templates based on your needs or write one of your own using a boilerplate" />
      <FeatureCard iconSrc={`${siteConfig.baseUrl}img/more-options.svg`} title="Much More!" description="You can generate your resolvers, your typescript interfaces, query builders, mutations, filters and more!" />
    </div>
  </div>
)

module.exports = FeatureCards
