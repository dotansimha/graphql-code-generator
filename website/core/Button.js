const React = require('react')

module.exports = props => <button {...props} className={`Button ${props.className || ''}`} />
