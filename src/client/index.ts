import { IFrame } from './iframe.js';
export { IFrame } from './iframe.js';

declare global {
  interface Window {
    iframe: HTMLIFrameElement;
  }
}

window.__MOCHA_EVENTS__ = [];
window.__TESTEA_EVENTS__ = [];

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

const setup = () => {
  const container = document.createElement('div');
  container.classList.add('container');

  const iframe = document.createElement('iframe');
  iframe.src = '';
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.frameBorder = '0';

  const mocha = document.createElement('div');
  mocha.id = 'mocha';

  if (window.location.search === '?hide-results=true') {
    mocha.classList.add('hide');
  }

  container.appendChild(mocha);
  container.appendChild(iframe);

  document.body.appendChild(container);
};

const run = (runner?: Mocha.Runner) => {
  before(function () {
    this.iframe = new IFrame(document.querySelector('iframe')!);
    window.iframe = this.iframe;
  });

  // give time to the browser to take the screenshot
  afterEach(function (done) {
    if (this.currentTest?.isFailed()) {
      setTimeout(done, 100);
    } else {
      done();
    }
  });

  registerMochaLifecycles(runner || mocha.run());
};

export default {
  setup,
  run,
};
