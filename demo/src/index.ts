import 'mocha';
import 'mocha/mocha.css';

import chai from 'chai';
import chaiDom from 'chai-dom';
import { setup } from '../../src/client';

import '../../src/client/testea.css';

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
