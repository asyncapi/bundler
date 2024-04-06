/**
 * In case `.cjs` extension is used, Node.js will recognize CJS module system
 * automatically.
 */

'use strict';

const { readFileSync, writeFileSync } = require('fs');
const bundle = require('@asyncapi/bundler');

async function main() {
  const document = await bundle(['./main151.yaml', './main153.yaml'].map( f => readFileSync(f, 'utf-8')), {
    xOrigin: false,
  });
  if (document.yml()) {
    writeFileSync('asyncapi.yaml', document.yml());
  }
}

main().catch(e => console.error(e));
