#!/usr/bin/env node

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const { launch } = require('./src/launch');

const argv = yargs(hideBin(process.argv)).argv;

if (!argv.specs) {
  process.exit(1);
}

launch(__dirname, argv).catch(console.error);
