/** @type {import("snowpack").SnowpackUserConfig } */

module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
    '../src': { url: '/test-runner' },
  },
  plugins: ['@snowpack/plugin-typescript'],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    polyfillNode: true,
  },
  devOptions: {
    open: 'none',
    port: 7357,
  },
  buildOptions: {
    /* ... */
  },
};
