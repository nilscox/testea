export { IFrame } from './iframe';

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

export const registerMochaLifecycles = async (runner: Mocha.Runner) => {
  const constants: Record<string, string> = (runner as any).constructor.constants;

  Object.values(constants).forEach(event => {
    runner.on(event, (...args: any[]) => {
      onLifecycleHook('runner', event, args.map(serialize));
    });
  });
};
