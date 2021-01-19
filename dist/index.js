import { IFrame } from './iframe.js';
export { IFrame } from './iframe.js';
window.__MOCHA_EVENTS__ = [];
const onLifecycleHook = (target, event, payload) => {
    // console.log(event, payload);
    window.__MOCHA_EVENTS__.push({ target, event, payload });
};
const serialize = (arg) => {
    if (arg instanceof Error) {
        return { stack: arg.stack, ...arg };
    }
    if (typeof arg.serialize === 'function') {
        return arg.serialize();
    }
    return arg;
};
const registerMochaLifecycles = async (runner) => {
    const constants = runner.constructor.constants;
    Object.values(constants).forEach(event => {
        runner.on(event, (...args) => {
            onLifecycleHook('runner', event, args.map(serialize));
        });
    });
};
export const setup = (runner) => {
    registerMochaLifecycles(runner);
    before(function () {
        this.iframe = new IFrame(document.querySelector('iframe'));
        window.iframe = this.iframe;
    });
    // give time to the browser to take the screenshot
    afterEach(function (done) {
        if (this.currentTest?.isFailed()) {
            setTimeout(done, 80);
        }
        else {
            done();
        }
    });
};
//# sourceMappingURL=index.js.map