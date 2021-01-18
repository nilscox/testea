import { IFrame } from './iframe.js';
export { IFrame } from './iframe.js';

declare global {
  interface Window {
    iframe: HTMLIFrameElement;
  }
}

window.__MOCHA_EVENTS__ = [];

const onLifecycleHook = (target: string, event: string, payload: {}) => {
  // console.log(event, payload);
  window.__MOCHA_EVENTS__.push({ target, event, payload });
};

const serialize = (arg: any) => {
  if (arg instanceof Error) {
    return { stack: arg.stack, ...arg };
  }

  if (typeof arg.serialize === 'function') {
    return arg.serialize();
  }

  return arg;
};

const registerMochaLifecycles = async (runner: Mocha.Runner) => {
  const constants: Record<string, string> = (runner as any).constructor.constants;

  Object.values(constants).forEach(event => {
    runner.on(event, (...args: any[]) => {
      onLifecycleHook('runner', event, args.map(serialize));
    });
  });
};

export const setup = (runner: Mocha.Runner) => {
  before(function () {
    this.iframe = new IFrame(document.querySelector('iframe')!);
    window.iframe = this.iframe;
  });

  registerMochaLifecycles(runner);
};
