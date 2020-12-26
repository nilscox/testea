const mocha = require('mocha');
const createStatsCollector = require('mocha/lib/stats-collector');

const setupMocha = () => {
  const {
    Runner,
    Suite,
    reporters: { Spec: Reporter },
  } = mocha;

  const suite = new Suite('root');
  const runner = new Runner(suite);

  createStatsCollector(runner);

  new Reporter(runner);

  const instances = {};

  const instanciate = data => {
    if (data.message && data.stack) {
      return Object.assign(new Error(), data);
    }

    const instance = Object.entries(data).reduce(
      (obj, [key, value]) => ({
        ...obj,
        [key.replace(/^\$\$/, '')]: key.startsWith('$$') ? () => value : value,
      }),
      {},
    );

    if (instance.id) {
      instances[instance.id] = instance;
    }

    if (instance.__mocha_id__) {
      instances[instance.__mocha_id__] = instance;
    }

    if (instance.parent) {
      instance.parent = instances[instance.parent.__mocha_id__];
    }

    if (instance.ctx && instance.ctx.currentTest) {
      instance.ctx.currentTest = instances[instance.ctx.currentTest.__mocha_id__];
    }

    return instance;
  };

  const handleMochaLifecycle = event => {
    if (event.target === 'runner') {
      const payload = (event.payload || []).map(instanciate);

      if (event.event === 'fail') {
        delete payload[0].err;
      }

      runner.emit(event.event, ...payload);
    }
  };

  return { runner, handleMochaLifecycle };
};

module.exports = setupMocha;
