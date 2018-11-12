const renderMarkdown = require('docusaurus/lib/core/renderMarkdown')
const fs = require('fs')
const React = require('react')

const { freeText } = require('../../../utils')

const input = fs.readFileSync(`${__dirname}/in.graphql`).toString()
const output = fs.readFileSync(`${__dirname}/out.ts`).toString()

const Code = (props) => {
  const code = renderMarkdown(`\`\`\`${props.ext}\n${freeText(props.body)}\n\`\`\``)

  return (
    <div dangerouslySetInnerHTML={{ __html: code }} className={props.className} style={props.style} />
  )
}

const IODemo = () => (
  <div className="IODemo">
    <Code className="IODemo-in" ext="graphql" body={input} />
    <Code className="IODemo-out" ext="typescript" body={output} />
  </div>
)

module.exports = IODemo
