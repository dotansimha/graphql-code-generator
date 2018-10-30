const validations = exports.validations = require('./validations')

// foo_barBaz -> ['foo', 'bar', 'Baz']
const splitWords = exports.splitWords = (str) => {
  return str
    .replace(/[A-Z]/, ' $&')
    .split(/[^a-zA-Z0-9]+/)
}

// upper -> Upper
const toUpperFirst = exports.toUpperFirst = (str) => {
  return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase()
}

// foo-bar-baz -> fooBarBaz
const toCamelCase = exports.toCamelCase = (str) => {
  const words = splitWords(str)
  const first = words.shift().toLowerCase()
  const rest = words.map(toUpperFirst)

  return [first, ...rest].join('')
}

// Pluck props of props.children into a child_type->child_props map
const pluckChildProps = exports.pluckChildProps = (children, whitelist) => {
  // Ensuring array
  children = [].concat(children).filter(Boolean)

  const childProps = {}

  // Ensure defaults
  if (whitelist) {
    whitelist.forEach((type) => {
      const name = toCamelCase(type)

      childProps[name] = {}
    })
  }

  children.forEach((child) => {
    if (whitelist && !whitelist.includes(child.type)) return

    const name = toCamelCase(child.type)
    const props = Object.assign({}, child.props)

    if (child.key != null) {
      props.key = child.key
    }

    if (child.ref != null) {
      props.ref = child.ref
    }

    childProps[name] = props
  })

  return childProps
}
