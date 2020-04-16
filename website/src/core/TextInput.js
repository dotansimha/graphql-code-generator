const React = require('react')

const { pluckChildProps } = require('../utils')

module.exports = (props) => {
  const childProps = pluckChildProps(props.children, [
    'container',
    'label',
    'input',
  ])

  return (
    <div {...props} className={`TextInput ${props.className || ''}`}>
      <div className="_label" {...childProps.label}>{childProps.label.children}</div>
      <input type="text" className="_input" {...childProps.input}>{childProps.input.children}</input>
    </div>
  )
}
