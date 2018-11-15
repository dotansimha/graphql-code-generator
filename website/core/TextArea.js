const React = require('react')

const { pluckChildProps } = require('../utils')

module.exports = (props) => {
  const childProps = pluckChildProps(props.children, [
    'container',
    'label',
    'input',
  ])

  return (
    <div {...props} className={`TextArea ${props.className || ''}`}>
      <div className="_label" {...childProps.label}>{childProps.label.children}</div>
      <textarea className="_input" {...childProps.input}>{childProps.input.children}</textarea>
    </div>
  )
}
