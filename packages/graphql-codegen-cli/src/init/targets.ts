import { resolve } from 'path';
import { readFileSync } from 'fs';
import { Tags } from './types';

export async function guessTargets(): Promise<Record<Tags, boolean>> {
  const pkg = JSON.parse(
    readFileSync(resolve(process.cwd(), 'package.json'), {
      encoding: 'utf-8'
    })
  );
  const dependencies = Object.keys({
    ...pkg.dependencies,
    ...pkg.devDependencies
  });

  return {
    [Tags.angular]: isAngular(dependencies),
    [Tags.react]: isReact(dependencies),
    [Tags.stencil]: isStencil(dependencies),
    [Tags.browser]: false,
    [Tags.node]: false,
    [Tags.typescript]: isTypescript(dependencies),
    [Tags.flow]: isFlow(dependencies)
  };
}

function isAngular(dependencies: string[]): boolean {
  return dependencies.includes('@angular/core');
}

function isReact(dependencies: string[]): boolean {
  return dependencies.includes('react');
}

function isStencil(dependencies: string[]): boolean {
  return dependencies.includes('@stencil/core');
}

function isTypescript(dependencies: string[]): boolean {
  return dependencies.includes('typescript');
}

function isFlow(dependencies: string[]): boolean {
  return dependencies.includes('flow');
}
