import chai, { expect } from 'chai';
import chaiDom from 'chai-dom';
import mocha from 'mocha/browser-entry';

import 'mocha/mocha.css';

import { IFrame } from './iframe';

mocha.setup('bdd');
chai.use(chaiDom);

window.__MOCHA_EVENTS__ = [];

const onLifecycleHook = (target: string, event: string, payload: {}) => {
  // console.log(event, payload);
  window.__MOCHA_EVENTS__.push({ target, event, payload });
};

const serialize = (arg: any) => {
  if (arg instanceof Error) {
    // return { message: arg.message, stack: arg.stack, ...arg };
    return { stack: arg.stack, ...arg };
  }

  if (typeof arg.serialize === 'function') {
    return arg.serialize();
  }

  return arg;
};

export const setup = (runner: Mocha.Runner) => {
  const constants: Record<string, string> = (runner as any).constructor.constants;

  Object.values(constants).forEach(event => {
    runner.on(event, (...args: any[]) => {
      onLifecycleHook('runner', event, args.map(serialize));
    });
  });

  before(function () {
    const iframe = (this.iframe = new IFrame());
    document.body.appendChild(this.iframe.element);

    const script = iframe.document!.createElement('script');
    script.src = '/content_script.js';
    iframe.body?.appendChild(script);
  });
};

(async () => {
  const specs = window.__SPECS__ || [];

  for (const spec of specs) {
    await import(spec);
  }

  setup(mocha.run());
})();
