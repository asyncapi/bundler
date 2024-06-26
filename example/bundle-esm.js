/**
 * To use `.js` extension with ESM module system, first add to
 * `package.json`
 * line
 * `"type": "module",`
 */

'use strict';

import { writeFileSync } from 'fs';
import bundle from '@asyncapi/bundler';

async function main() {
  const document = await bundle(['./main.yaml'], {
    xOrigin: true,
  });
  if (document.yml()) {
    writeFileSync('asyncapi.yaml', document.yml());
  }
}

main().catch(e => console.error(e));
