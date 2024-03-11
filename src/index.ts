import { toJS, resolve, versionCheck, resolveBaseFileDir } from './util';
import { Document } from './document';
import { parse } from './parser';

import type { AsyncAPIObject } from './spec-types';
import { resolveV3Document } from './v3/parser';

/**
 *
 * @param {string[]} files Array of stringified AsyncAPI documents in YAML
 * format, that are to be bundled (or array of filepaths, resolved and passed
 * via `Array.map()` and `fs.readFileSync`, which is the same, see `README.md`).
 * @param {Object} [options]
 * @param {string | object} [options.base] Base object whose properties will be
 * retained.
 * @param {boolean} [options.referenceIntoComponents] Pass `true` to resolve
 * external references to components.
 * @param {string} [options.baseDir] Pass folder path to 
 *
 * @return {Document}
 *
 * @example
 *
 * **TypeScript**
 * ```ts
 * import { readFileSync, writeFileSync } from 'fs';
 * import bundle from '@asyncapi/bundler';
 *
 * async function main() {
 *   const document = await bundle([readFileSync('./main.yaml', 'utf-8')], {
 *     referenceIntoComponents: true,
 *   });
 *
 *   console.log(document.yml()); // the complete bundled AsyncAPI document
 *   writeFileSync('asyncapi.yaml', document.yml());  // the complete bundled AsyncAPI document
 * }
 *
 * main().catch(e => console.error(e));
 * ```
 *
 * **JavaScript CJS module system**
 * ```js
 * 'use strict';
 *
 * const { readFileSync, writeFileSync } = require('fs');
 * const bundle = require('@asyncapi/bundler');
 *
 * async function main() {
 *   const document = await bundle([readFileSync('./main.yaml', 'utf-8')], {
 *     referenceIntoComponents: true,
 *   });
 *   writeFileSync('asyncapi.yaml', document.yml());
 * }
 *
 * main().catch(e => console.error(e));
 * ```
 *
 * **JavaScript ESM module system**
 * ```js
 * 'use strict';
 *
 * import { readFileSync, writeFileSync } from 'fs';
 * import bundle from '@asyncapi/bundler';
 *
 * async function main() {
 *   const document = await bundle([readFileSync('./main.yaml', 'utf-8')], {
 *     referenceIntoComponents: true,
 *   });
 *   writeFileSync('asyncapi.yaml', document.yml());
 * }
 *
 * main().catch(e => console.error(e)); 
 * ```
 *
 */
export default async function bundle(files: string[], options: any = {}) {
  if (typeof options.base !== 'undefined') {
    options.base = toJS(options.base);
    await parse(options.base, options);
  }

  const parsedJsons = files.map(file => toJS(file)) as AsyncAPIObject[];

  if (typeof options.baseDir !== 'undefined') {
    parsedJsons.forEach(parsedJson => resolveBaseFileDir(parsedJson, options.baseDir));
  }

  const majorVersion = versionCheck(parsedJsons);
  let resolvedJsons;

  if (majorVersion === 3) {
    resolvedJsons = await resolveV3Document(parsedJsons, options);
  } else {
    /**
     * Bundle all external references for each file.
     * @private
     */
    resolvedJsons = await resolve(parsedJsons, options);
  }

  return new Document(resolvedJsons as AsyncAPIObject[], options.base);
}

// 'module.exports' is added to maintain backward compatibility with Node.js
// projects, that use CJS module system.
module.exports = bundle;
