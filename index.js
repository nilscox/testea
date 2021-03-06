#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { launch } = require('./src/launch');

yargs(hideBin(process.argv))
  .command(
    'run [url]',
    'launch a browser and start the tests',
    yargs => {
      yargs.positional('url', {
        describe: 'URL exposing the tests running with mocha in the browser',
        type: 'string',
        default: 'http://localhost:7357',
      });

      yargs.option('headless', {
        describe: 'launch the browser in headless mode',
        type: 'boolean',
      });

      yargs.option('window-size', {
        describe: 'specify the size of the brower window',
        type: 'string',
        default: '1920,1080',
      });

      yargs.option('keep-open', {
        describe: 'keep the browser open when all tests ended',
        type: 'boolean',
      });

      yargs.option('devtool', {
        describe: 'automatically open the devtool',
        type: 'boolean',
      });

      yargs.option('screenshot', {
        describe: 'save a screenshot when a test has failed',
        type: 'boolean',
      });

      yargs.option('screenshots-dir', {
        describe: 'specify a base directory where screenshots are saved',
        type: 'string',
        default: './screenshots',
      });

      yargs.option('hide-results', {
        describe: "hide mocha runner's interface displaying the tests results",
        type: 'boolean',
      });

      yargs.conflicts('headless', 'devtool');
    },
    launch,
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  }).argv;
