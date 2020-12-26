const path = require('path');
const { startDevServer, createConfiguration } = require('snowpack');

const devServer = async (baseDir, specs) => {
  const [, config] = createConfiguration({
    // install: ['@testing-library/user-event'],
    installOptions: {
      polyfillNode: true,
    },
    devOptions: {
      open: 'none',
      port: 7357,
      output: 'stream',
    },
    mount: {
      [path.join(baseDir, 'public')]: { url: '/', static: true },
      [path.join(baseDir, 'src')]: '/dist',
      e2e: '/e2e',
    },
    plugins: [['snowpack-plugin-test-runner', { specs }]],
  });

  const server = await startDevServer({
    cwd: process.cwd(),
    config,
  });

  return () => server.shutdown();
};

module.exports.devServer = devServer;
