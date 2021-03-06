const fs = require('fs').promises;
const path = require('path');

const { browser } = require('./browser');
const setupMocha = require('./mocha');

const saveScreenshot = async (filePath, screenshot) => {
  const dirPath = path.dirname(filePath);

  try {
    const stats = await fs.stat(dirPath);

    if (stats && !stats.isDirectory()) {
      throw new Error(`Cannot save screenshot: ${dirPath} exists and is not a directory`);
    }
  } catch (e) {
    if (e.message.match(/ENOENT/)) {
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw e;
    }
  }

  return fs.writeFile(filePath, Buffer.from(screenshot, 'base64'));
};

const launch = async argv => {
  const { runner, handleMochaLifecycle } = setupMocha();
  const { startEventsLoop, stopEventsLoop, takeScreenshot } = await browser(argv);

  runner.on('end', stopEventsLoop);
  // process.on('SIGINT', stopEventsLoop);

  runner.on('fail', async function (test) {
    if (!argv.screenshot) {
      return;
    }

    const screenshot = await takeScreenshot();

    const filePath = path.join(
      argv.screenshotsDir,
      test
        .titlePath()
        .map(s => s.replace(/[^-_0-9a-z ]/gi, '_'))
        .join('/') + '.png',
    );

    await saveScreenshot(filePath, screenshot);
  });

  const handleTesteaEvent = async event => {
    if (event.type === 'screenshot') {
      await saveScreenshot(path.join(argv.screenshotsDir, event.path), await takeScreenshot());
    }
  };

  await startEventsLoop(handleMochaLifecycle, handleTesteaEvent);

  process.exit(Math.min(255, runner.stats.failures));
};

module.exports.launch = launch;
