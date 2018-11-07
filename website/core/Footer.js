/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const siteConfig = require('../siteConfig')
const Hyperlink = require('./Hyperlink')

const Footer = (props) => (
  <footer className="nav-footer" id="footer">
    <a href={props.config.baseUrl} className="nav-home">
      <img
        className="nav-footer-image"
        src={props.config.baseUrl + props.config.footerIcon}
        alt={props.config.title}
        width="145"
        height="23"
      />
    </a>
    <div className="navSocials">
      <Hyperlink className="_channel" href={siteConfig.githubUrl}><img src={`${props.config.baseUrl}img/socials/github.svg`} alt="github" /></Hyperlink>
      <Hyperlink className="_channel" href={siteConfig.mediumUrl}><img src={`${props.config.baseUrl}img/socials/medium.svg`} alt="medium" /></Hyperlink>
      <Hyperlink className="_channel" href={siteConfig.twitterUrl}><img src={`${props.config.baseUrl}img/socials/twitter.svg`} alt="twitter" /></Hyperlink>
    </div>
    <div className="navMenu">
      <a href={`${siteConfig.baseUrl}docs/getting-started`}>
        Docs
      </a>
      <a href={`${siteConfig.baseUrl}help`}>
        Help
      </a>
    </div>
    <div className="navCopyright navCopyrightDesktop">
      © Copyrights by The Guild, all rights reserved
    </div>
    <div className="navCopyright navCopyrightMobile">
      © The Guild 2018
    </div>
    <div className="navMessage">
      GraphQL Code Generator is licensed under MIT and can be used free of charge and no restrictions
    </div>
  </footer>
)

module.exports = Footer
