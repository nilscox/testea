import 'mocha';
import chai from 'chai';
import chaiDom from 'chai-dom';

import 'mocha/mocha.css';

import { IFrame } from './iframe';

export * from './iframe';

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
    this.iframe = new IFrame(document.querySelector('iframe')!);
  });
};

(async () => {
  const specs = window.__SPECS__ || [];

  for (const spec of specs) {
    await import(spec);
  }

  setup(mocha.run());
})();
