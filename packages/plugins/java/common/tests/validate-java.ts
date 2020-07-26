import { parse } from 'java-parser';

export function validateJava(content: string): void {
  parse(content);
}
