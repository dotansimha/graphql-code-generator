/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const siteConfig = require('../siteConfig')

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl
    return `${baseUrl}docs/${language ? `${language}/` : ''}${doc}`
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl
    return baseUrl + (language ? `${language}/` : '') + doc
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <a href={this.props.config.baseUrl} className="nav-home">
          {this.props.config.footerIcon && (
            <img
              src={this.props.config.baseUrl + this.props.config.footerIcon}
              alt={this.props.config.title}
              width="145"
              height="23"
            />
          )}
        </a>
        <div className="navMenu">
          <a href={siteConfig.githubUrl}>
            TRY IT OUT
          </a>
          <span>⦁</span>
          <a href={`${siteConfig.baseUrl}docs/getting-started`}>
            VIEW DOCS
          </a>
          <span>⦁</span>
          <a href={`${siteConfig.baseUrl}help`}>
            CONTACT US
          </a>
        </div>
        <div className="navCopyright">
          <span>All rights reserved </span>
          <span>© 2018 The Guild</span>
        </div>
      </footer>
    )
  }
}

module.exports = Footer
