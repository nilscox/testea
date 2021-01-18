import 'mocha';
import 'mocha/mocha.css';

import chai from 'chai';
import chaiDom from 'chai-dom';
import { setup, IFrame } from '../../src/client';

mocha.setup('bdd');
chai.use(chaiDom);

const main = async () => {
  await import('./test');
  await import('./local-storage');
  await import('./cookies');
  await import('./cah');

  setup(mocha.run());
};

main().catch(console.error);
