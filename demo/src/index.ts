import 'mocha';
import 'mocha/mocha.css';

import chai from 'chai';
import chaiDom from 'chai-dom';
import { registerMochaLifecycles, IFrame } from '../../src/client';

mocha.setup('bdd');
chai.use(chaiDom);

const main = async () => {
  before(function () {
    this.iframe = new IFrame(document.querySelector('iframe')!);
  });

  afterEach(function (done) {
    if (this.currentTest?.isFailed()) {
      // give time to the browser to take the screenshot
      setTimeout(done, 80);
    } else {
      done();
    }
  });

  await import('./test');
  await import('./local-storage');
  await import('./cookies');

  registerMochaLifecycles(mocha.run());
};

main().catch(console.error);
