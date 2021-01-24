const { Builder, Capabilities } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');

const handleUncaughtExceptions = driver => {
  const unhandledRejection = reason => {
    console.error('Unhandled Rejection', reason);
    driver.quit();
  };

  const uncaughtException = err => {
    console.error('Uncaught Exception', err);
    driver.quit();
  };

  process.on('unhandledRejection', unhandledRejection);
  process.on('uncaughtException', uncaughtException);
};

const browser = async () => {
  const args = {
    headless: process.argv.includes('--headless'),
    keepOpen: process.argv.includes('--keep-open'),
    devtool: process.argv.includes('--devtool'),
  };

  const options = new Options();

  options.addArguments('--disable-web-security');
  options.addArguments('--user-data-dir=/tmp/test-runner');
  // options.addArguments(`--load-extension=${__dirname}/extension`);
  options.addArguments('--window-size=1920,1080');

  if (args.devtool) {
    options.addArguments('--auto-open-devtools-for-tabs');
  }

  if (args.headless) {
    options.addArguments('--headless');
  }

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .withCapabilities(Capabilities.chrome())
    .build();

  handleUncaughtExceptions(driver);

  await driver.navigate().to('http://localhost:7357');

  let running = true;

  const startEventsLoop = async handleMochaLifecycle => {
    while (running || args.keepOpen) {
      const events = await driver.executeAsyncScript(onResult => {
        onResult(window.__MOCHA_EVENTS__ || []);
        window.__MOCHA_EVENTS__ = [];
      });

      events.forEach(handleMochaLifecycle);

      await new Promise(resolve => setTimeout(resolve, 10));
    }

    await driver.quit();
  };

  const stopEventsLoop = async () => {
    running = false;
    await new Promise(resolve => setTimeout(resolve, 20));
  };

  const getCoverage = async () => {
    return driver.executeAsyncScript(onResult => {
      onResult(window.iframe.contentWindow.__coverage__);
    });
  };

  const takeScreenshot = () => driver.takeScreenshot();

  return { startEventsLoop, stopEventsLoop, takeScreenshot, getCoverage };
};

module.exports.browser = browser;
