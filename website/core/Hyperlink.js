const React = require('react')

module.exports = props => <a {...props} className={`Hyperlink ${props.className || ''}`} />
