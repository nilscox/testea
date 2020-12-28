const fs = require('fs').promises;
const glob = require('tiny-glob');

const { devServer } = require('./devServer');
const { browser } = require('./browser');
const setupMocha = require('./mocha');

const launch = async (baseDir, argv) => {
  const files = await glob(argv.specs);
  const specs = files.map(file => file.replace(/\.ts$/, '.js')).map(file => `'/${file}'`);

  const { runner, handleMochaLifecycle } = setupMocha();
  const shutdown = await devServer(baseDir, specs, argv.dir);
  const { startEventsLoop, stopEventsLoop, takeScreenshot } = await browser();

  runner.on('end', stopEventsLoop);
  // process.on('SIGINT', stopEventsLoop);

  runner.on('fail', async () => {
    const screenshot = await takeScreenshot();
    await fs.writeFile('/tmp/screenshot.png', Buffer.from(screenshot, 'base64'));
  });

  await startEventsLoop(handleMochaLifecycle);
  await shutdown();

  process.exit(0);
};

module.exports.launch = launch;
