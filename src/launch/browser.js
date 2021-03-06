const { Builder, Capabilities } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const queryString = require('query-string');

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

const browser = async (url, { headless, windowSize, iframeSize, keepOpen, devtool, hideResults }) => {
  const options = new Options();

  options.addArguments('--disable-web-security');
  options.addArguments('--user-data-dir=/tmp/test-runner');
  // options.addArguments(`--load-extension=${__dirname}/extension`);
  options.addArguments('--window-size=' + windowSize);

  if (devtool) {
    options.addArguments('--auto-open-devtools-for-tabs');
  }

  if (headless) {
    options.addArguments('--headless');
  }

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .withCapabilities(Capabilities.chrome())
    .build();

  handleUncaughtExceptions(driver);

  const query = queryString.stringify({
    'iframe-size': iframeSize,
    'hide-results': hideResults,
  });

  await driver.navigate().to([url, query].join('?'));

  let running = true;

  const startEventsLoop = async (handleMochaLifecycle, handleTesteaEvent) => {
    const captureWindowEvents = onResult => {
      onResult({
        mocha: window.__MOCHA_EVENTS__ || [],
        testea: window.__TESTEA_EVENTS__ || [],
      });

      window.__MOCHA_EVENTS__ = [];
      window.__TESTEA__ = [];
    };

    while (running) {
      try {
        const events = await driver.executeAsyncScript(captureWindowEvents);

        if (events) {
          events.mocha.forEach(handleMochaLifecycle);
          events.testea.forEach(handleTesteaEvent);
        }
      } catch (e) {
        if (e.message.match('target window already closed')) {
          stopEventsLoop();
          process.exit(0);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 10));
    }

    if (!keepOpen) {
      await driver.quit();
    }
  };

  const stopEventsLoop = () => {
    running = false;
  };

  const takeScreenshot = () => driver.takeScreenshot();

  return { startEventsLoop, stopEventsLoop, takeScreenshot };
};

module.exports.browser = browser;
