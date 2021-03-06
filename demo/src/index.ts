import mocha from 'mocha';
import chai from 'chai';
import chaiDom from 'chai-dom';
import testea from 'testea';

import 'mocha/mocha.css';
import 'testea/testea.css';

const main = async () => {
  testea.setup();
  mocha.setup('bdd');
  chai.use(chaiDom);

  // the tests need to be imported after calling mocha.setup()
  await import('./test');
  await import('./local-storage');
  await import('./cookies');
  await import('./testing-library');
  await import('./screenshot');

  testea.run();
};

main().catch(console.error);
