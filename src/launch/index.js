const fs = require('fs').promises;
const path = require('path');

const { browser } = require('./browser');
const setupMocha = require('./mocha');

const arg = name => {
  const idx = process.argv.indexOf(name);

  if (idx > 0) {
    return process.argv[idx + 1] || true;
  }
};

const launch = async () => {
  const screenshots = arg('--screenshots');

  const { runner, handleMochaLifecycle } = setupMocha();
  const { startEventsLoop, stopEventsLoop, takeScreenshot } = await browser();

  runner.on('end', stopEventsLoop);
  // process.on('SIGINT', stopEventsLoop);

  if (screenshots) {
    runner.on('fail', async function (test) {
      const screenshot = await takeScreenshot();
      const filePath = path.join(screenshots, test.titlePath().join('_') + '.png');

      await fs.writeFile(filePath, Buffer.from(screenshot, 'base64'));
    });
  }

  await startEventsLoop(handleMochaLifecycle);

  process.exit(Math.min(255, runner.stats.failures));
};

module.exports.launch = launch;
