/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')

const MarkdownBlock = CompLibrary.MarkdownBlock /* Used to read markdown */
const Container = CompLibrary.Container
const GridBlock = CompLibrary.GridBlock

const siteConfig = require(`${process.cwd()}/siteConfig.js`)
const IODemo = require(`${process.cwd()}/core/home/IODemo`)
const FeatureCards = require(`${process.cwd()}/core/home/FeatureCards`)
const CompanyCards = require(`${process.cwd()}/core/home/CompanyCards`)

function imgUrl(img) {
  return `${siteConfig.baseUrl}img/${img}`
}

function docUrl(doc, language) {
  return `${siteConfig.baseUrl}docs/${language ? `${language}/` : ''}${doc}`
}

function pageUrl(page, language) {
  return siteConfig.baseUrl + (language ? `${language}/` : '') + page
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    )
  }
}

Button.defaultProps = {
  target: '_self',
}

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
)

const ProjectTitle = () => (
  <h2 className="projectTitle">
    <img src={siteConfig.ogImage} />
    <small>{siteConfig.tagline}</small>
  </h2>
)

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
)

class HomeSplash extends React.Component {
  render() {
    const language = this.props.language || ''
    return (
      <SplashContainer>
        <div className="inner">
          <ProjectTitle />
          <PromoSection>
            <Button href={siteConfig.githubUrl}>Try It Out</Button>
            <Button href={`${siteConfig.baseUrl}docs`}>View Docs</Button>
            <Button href={`${siteConfig.baseUrl}docs`}>Contact Us</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    )
  }
}

const CLIDemo = () => (
  <div className="cliDemoSection">
    <h1 className="cliTitle">
      <span>$ gql-gen --schema schema.graphql --template ts</span><div className="cursor" />
    </h1>
    <IODemo />
  </div>
)

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}>
    <GridBlock align="center" contents={props.children} layout={props.layout} />
  </Container>
)

class Index extends React.Component {
  render() {
    const language = this.props.language || ''

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer homeMainContainer">
          <CLIDemo />
          <FeatureCards />
          <CompanyCards />
        </div>
      </div>
    )
  }
}

module.exports = Index
