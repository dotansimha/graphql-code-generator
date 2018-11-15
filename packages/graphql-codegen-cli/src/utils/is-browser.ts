/* global window */

declare let window: any, process: any;

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

export { isBrowser, isNode };
