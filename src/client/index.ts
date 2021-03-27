import queryString from 'query-string';

import { IFrame } from './iframe.js';
export { IFrame } from './iframe.js';

declare global {
  interface Window {
    iframe: HTMLIFrameElement;
  }
}

window.__MOCHA_EVENTS__ = [];
window.__TESTEA_EVENTS__ = [];

const query = queryString.parse(window.location.search);
const hideResults = query['hide-results'];
const iframeSize = query['iframe-size'];

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
  iframe.frameBorder = '0';

  const iframeContainer = document.createElement('div');
  iframeContainer.id = 'iframe-container';
  iframeContainer.appendChild(iframe);

  const mocha = document.createElement('div');
  mocha.id = 'mocha';

  if (hideResults) {
    mocha.classList.add('hide');
  }

  container.appendChild(mocha);
  container.appendChild(iframeContainer);

  document.body.appendChild(container);
};

const run = (runner?: Mocha.Runner) => {
  before(function () {
    this.iframe = new IFrame(document.querySelector('iframe')!);
    window.iframe = this.iframe;
  });

  beforeEach(function () {
    if (iframeSize) {
      const match = String(iframeSize).match(/(\d+),(\d+)/);

      if (!match) {
        throw new Error(`iframe size must be "width,height", got ${iframeSize}`);
      }

      this.iframe.setViewportSize(Number(match[1]), Number(match[2]));
    } else {
      this.iframe.setViewportSize('100%', '100%');
    }
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
