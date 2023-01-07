import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Tags } from './types.js';

export async function guessTargets(): Promise<Record<Tags, boolean>> {
  const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
  const dependencies = Object.keys({
    ...pkg.dependencies,
    ...pkg.devDependencies,
  });

  return {
    [Tags.angular]: isAngular(dependencies),
    [Tags.react]: isReact(dependencies),
    [Tags.stencil]: isStencil(dependencies),
    [Tags.vue]: isVue(dependencies),
    [Tags.client]: false,
    [Tags.node]: false,
    [Tags.typescript]: isTypescript(dependencies),
    [Tags.flow]: isFlow(dependencies),
    [Tags.graphqlRequest]: isGraphqlRequest(dependencies),
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

function isVue(dependencies: string[]): boolean {
  return dependencies.includes('vue') || dependencies.includes('nuxt');
}

function isTypescript(dependencies: string[]): boolean {
  return dependencies.includes('typescript');
}

function isFlow(dependencies: string[]): boolean {
  return dependencies.includes('flow');
}

function isGraphqlRequest(dependencies: string[]): boolean {
  return dependencies.includes('graphql-request');
}
