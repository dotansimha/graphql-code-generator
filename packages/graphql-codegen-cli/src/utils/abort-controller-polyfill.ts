import { EventEmitter } from 'events';
import { debugLog } from './debugging.js';

/**
 * Node v14 does not have AbortSignal or AbortController, so to safely use it in
 * another module, you can import it from here.
 *
 * Node v14.7+ does have it, but only with flag --experimental-abortcontroller
 *
 * We don't actually use AbortController anywhere except in tests, but it
 * still gets called in watcher.ts, so by polyfilling it we can avoid breaking
 * existing installations using Node v14 without flag --experimental-abortcontroller,
 * and we also ensure that tests continue to pass under Node v14 without any new flags.
 *
 * This polyfill was adapted (TypeScript-ified) from here:
 * https://github.com/southpolesteve/node-abort-controller/blob/master/index.js
 */

class AbortSignalPolyfill implements AbortSignal {
  eventEmitter: EventEmitter;
  onabort: EventListener;
  aborted: boolean;
  reason: any | undefined;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.onabort = null;
    this.aborted = false;
    this.reason = undefined;
  }
  toString() {
    return '[object AbortSignal]';
  }
  get [Symbol.toStringTag]() {
    return 'AbortSignal';
  }
  removeEventListener(name, handler) {
    this.eventEmitter.removeListener(name, handler);
  }
  addEventListener(name, handler) {
    this.eventEmitter.on(name, handler);
  }
  // @ts-expect-error No Event type in Node 14
  dispatchEvent(type: string) {
    const event = { type, target: this };
    const handlerName = `on${event.type}`;

    if (typeof this[handlerName] === 'function') this[handlerName](event);

    return this.eventEmitter.emit(event.type, event);
  }
  throwIfAborted() {
    if (this.aborted) {
      throw this.reason;
    }
  }
  static abort(reason: any) {
    const controller = new AbortController();
    controller.abort(reason);
    return controller.signal;
  }
  static timeout(time) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new Error('TimeoutError')), time);
    return controller.signal;
  }
}
const AbortSignal = global.AbortSignal ?? AbortSignalPolyfill;

class AbortControllerPolyfill implements AbortController {
  signal: AbortSignal;

  constructor() {
    debugLog('Using polyfilled AbortController');
    // @ts-expect-error No Event type in Node 14
    this.signal = new AbortSignal();
  }
  abort(reason?: any) {
    if (this.signal.aborted) return;

    // @ts-expect-error Not a read only property when polyfilling
    this.signal.aborted = true;

    if (reason) {
      // @ts-expect-error Not a read only property when polyfilling
      this.signal.reason = reason;
    } else {
      // @ts-expect-error Not a read only property when polyfilling
      this.signal.reason = new Error('AbortError');
    }

    // @ts-expect-error No Event type in Node 14
    this.signal.dispatchEvent('abort');
  }
  toString() {
    return '[object AbortController]';
  }
  get [Symbol.toStringTag]() {
    return 'AbortController';
  }
}

const AbortController = global.AbortController ?? AbortControllerPolyfill;

export { AbortController };
