// https://github.com/sindresorhus/indent-string/blob/main/index.js
export interface IndentStringOptions {
  /**
	The string to use for the indent.
	@default ' '
	*/
  readonly indent?: string;

  /**
	Also indent empty lines.
	@default false
	*/
  readonly includeEmptyLines?: boolean;
}

/**
Indent each line in a string.
@param string - The string to indent.
@param count - How many times you want `options.indent` repeated. Default: `1`.
@example
```
import indentString from 'indent-string';
indentString('Unicorns\nRainbows', 4);
//=> '    Unicorns\n    Rainbows'
indentString('Unicorns\nRainbows', 4, {indent: '♥'});
//=> '♥♥♥♥Unicorns\n♥♥♥♥Rainbows'
```
*/
export function indentString(string: string, count = 1, options: IndentStringOptions = {}) {
  const { indent = ' ', includeEmptyLines = false } = options;

  if (typeof string !== 'string') {
    throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof string}\``);
  }

  if (typeof count !== 'number') {
    throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof count}\``);
  }

  if (count < 0) {
    throw new RangeError(`Expected \`count\` to be at least 0, got \`${count}\``);
  }

  if (typeof indent !== 'string') {
    throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof indent}\``);
  }

  if (count === 0) {
    return string;
  }

  const regex = includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;

  return string.replace(regex, indent.repeat(count));
}
