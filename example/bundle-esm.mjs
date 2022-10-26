/**
 * In case `.mjs` extension is used, Node.js will recognize ESM module system
 * automatically.
 */

'use strict';

import { readFileSync, writeFileSync } from 'fs';
import bundle from '@asyncapi/bundler';

async function main() {
  const document = await bundle([readFileSync('./main.yaml', 'utf-8')], {
    referenceIntoComponents: true,
  });
  writeFileSync('asyncapi.yaml', document.yml());
}

main().catch(e => console.error(e));
