import { getOptions } from 'loader-utils';

export default function loader(content) {
  const options = getOptions(this) || {};
  const callback = this.async();

  // TODO: Load options.schema

  // TODO: Transform file `content` with the graphql-codegen plugins
  const transformed = `export default \`${content}\``;

  // Once done transforming, call `callback` with the new code
  callback(null, transformed);
}
