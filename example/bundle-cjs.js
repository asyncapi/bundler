/**
 * To use `.js` extension with CJS module system, make sure
 * `package.json`
 * DOES NOT contain line
 * `"type": "module",`
 */

'use strict';

const { readFileSync, writeFileSync } = require('fs');
const bundle = require('@asyncapi/bundler');

async function main() {
  const document = await bundle([readFileSync('./main.yaml', 'utf-8')], {
    referenceIntoComponents: true,
  });
  writeFileSync('asyncapi.yaml', document.yml());
}

main().catch(e => console.error(e));
