import { capitalize } from '../utils/capitalize';

export function getFieldResolverName(name) {
  return `${capitalize(name)}Resolver`;
}
