#!/usr/bin/env node

const { launch } = require('./src/launch');

launch().catch(console.error);
