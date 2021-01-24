const fs = require('fs').promises;
const path = require('path');
const NYC = require('nyc');

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
  const dir = arg('--dir');

  const { runner, handleMochaLifecycle } = setupMocha();
  const { startEventsLoop, stopEventsLoop, takeScreenshot, getCoverage } = await browser();

  if (screenshots) {
    runner.on('fail', async function (test) {
      const screenshot = await takeScreenshot();
      const filePath = path.join(
        screenshots,
        test
          .titlePath()
          .join('__')
          .replace(/[^-_0-9a-z ]/gi, '_') + '.png',
      );

      await fs.writeFile(filePath, Buffer.from(screenshot, 'base64'));
    });
  }

  const nyc = new NYC({
    cwd: path.resolve(dir),
  });

  runner.on('start', async () => {
    await nyc.reset();
  });

  runner.on('test end', async () => {
    global.__coverage__ = await getCoverage();
    nyc.writeCoverageFile();
  });

  runner.on('end', async () => {
    await stopEventsLoop();
    process.exitCode = Math.min(255, runner.stats.failures);
  });

  // process.on('SIGINT', stopEventsLoop);

  await startEventsLoop(handleMochaLifecycle);
};

module.exports.launch = launch;
