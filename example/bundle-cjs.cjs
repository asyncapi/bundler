/**
 * In case `.cjs` extension is used, Node.js will recognize CJS module system
 * automatically.
 */

'use strict';

const { readFileSync, writeFileSync } = require('fs');
const bundle = require('@asyncapi/bundler');

async function main() {
  const document = await bundle([readFileSync('./main.yaml', 'utf-8')], {
    'x-origin': true,
  });
  if (document.yml()) {
    writeFileSync('asyncapi.yaml', document.yml());
  }
}

main().catch(e => console.error(e));
