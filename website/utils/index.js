const React = require('react')

const validations = exports.validations = require('./validations')

// Will use the shortest indention as an axis
const freeText = exports.freeText = (text) => {
  if (text instanceof Array) {
    text = text.join('')
  }

  // This will allow inline text generation with external functions, same as ctrl+shift+c
  // As long as we surround the inline text with ==>text<==
  text = text.replace(
    /( *)==>((?:.|\n)*?)<==/g,
    (match, baseIndent, content) =>
  {
    return content
      .split('\n')
      .map(line => `${baseIndent}${line}`)
      .join('\n')
  })

  const lines = text.split('\n')

  const minIndent = lines.filter(line => line.trim()).reduce((minIndent, line) => {
    const currIndent = line.match(/^ */)[0].length

    return currIndent < minIndent ? currIndent : minIndent
  }, Infinity)

  return lines
    .map(line => line.slice(minIndent))
    .join('\n')
    .trim()
    .replace(/\n +\n/g, '\n\n')
}

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

const toInlineScript = exports.toInlineScript = (relativeScriptPath) => {
  const babel = require('@babel/core')
  const fs = require('fs')
  const path = require('path')

  let script

  if (relativeScriptPath instanceof Function) {
    script = babel.transform(`(${relativeScriptPath})()`, {
      presets: ['@babel/preset-env', 'babel-preset-minify'],
      code: true,
      ast: false,
    }).code

    return React.createElement('script', { dangerouslySetInnerHTML: {
      __html: `(function(){if(!window.GQLCodegen)window.GQLCodegen={};var require=function(path){return window.GQLCodegen[path]};${script}})()`
    } })
  }

  const scriptPath = path.resolve(process.cwd(), relativeScriptPath) + '.js'
  script = toInlineScript.cache[scriptPath]

  if (!toInlineScript.cache[scriptPath]) {
    script = fs.readFileSync(scriptPath).toString()
    script = babel.transform(script, {
      presets: ['@babel/preset-env', 'babel-preset-minify'],
      code: true,
      ast: false,
    }).code

    toInlineScript.cache[scriptPath] = script
  }

  return React.createElement('script', { dangerouslySetInnerHTML: {
    __html: `(function(){if(!window.GQLCodegen)window.GQLCodegen={};if(!window.GQLCodegen['${relativeScriptPath}'])window.GQLCodegen['${relativeScriptPath}']={};var exports=window.GQLCodegen['${relativeScriptPath}'];var module=Object.defineProperties({},{exports:{get(){return exports},set(v){return exports=window.GQLCodegen['${relativeScriptPath}']=v}}});var require=function(path){return window.GQLCodegen[path]};${script}})()`
  } })
}
toInlineScript.cache = {}
