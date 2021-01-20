import 'mocha';
import 'mocha/mocha.css';

import chai from 'chai';
import chaiDom from 'chai-dom';
import testea from 'testea';

import 'testea/testea.css';

const main = async () => {
  testea.setup();
  mocha.setup('bdd');
  chai.use(chaiDom);

  await import('./test');
  await import('./local-storage');
  await import('./cookies');

  testea.run();
};

main().catch(console.error);
