export { IFrame } from './iframe';
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
export const registerMochaLifecycles = async (runner) => {
    const constants = runner.constructor.constants;
    Object.values(constants).forEach(event => {
        runner.on(event, (...args) => {
            onLifecycleHook('runner', event, args.map(serialize));
        });
    });
};
//# sourceMappingURL=index.js.map