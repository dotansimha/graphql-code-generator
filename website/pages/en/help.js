/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

const CompLibrary = require('../../core/CompLibrary.js')

const { toInlineScript } = require(`${process.cwd()}/utils`)
const siteConfig = require(`${process.cwd()}/siteConfig`)
const ContactForm = require(`${process.cwd()}/core/help/ContactForm.js`)

const Container = CompLibrary.Container

class Help extends React.Component {
  render() {
    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <header className="postHeader">
              <h2>Need help?</h2>
              <h1 style={{ marginTop: 0 }}>We've got you covered!</h1>
            </header>
          </div>
          <div className="helpTitle">Expert Support</div>
          <div className="helpSubtitle">Get our team's help with Apollo, GraphQL and GraphQL Modules. Whether you’re just getting started or rolling out GraphQL across your whole organization, we can help with architectural design, implementation and education.</div>
          <ContactForm />
          <script src={`${siteConfig.baseUrl}lib/sweetalert2.all.min.js`} />
          {toInlineScript(`utils/validations.js`)}
        </Container>
      </div>
    )
  }
}

module.exports = Help
