const fs = require('fs').promises;

const { browser } = require('./browser');
const setupMocha = require('./mocha');

const launch = async () => {
  const { runner, handleMochaLifecycle } = setupMocha();
  const { startEventsLoop, stopEventsLoop, takeScreenshot } = await browser();

  runner.on('end', stopEventsLoop);
  // process.on('SIGINT', stopEventsLoop);

  runner.on('fail', async () => {
    const screenshot = await takeScreenshot();
    await fs.writeFile('/tmp/screenshot.png', Buffer.from(screenshot, 'base64'));
  });

  await startEventsLoop(handleMochaLifecycle);

  process.exit(0);
};

module.exports.launch = launch;
