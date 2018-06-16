import { SafeString } from 'handlebars';

export function toJSON(type, options) {
  if (!options) {
    return '';
  }

  return new SafeString(JSON.stringify(options.data.root.rawSchema));
}
