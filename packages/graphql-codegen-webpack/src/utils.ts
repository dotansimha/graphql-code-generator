import { createHash } from 'crypto';

export function checksum(str: string) {
  return createHash('md5')
    .update(str, 'utf8')
    .digest('hex');
}
