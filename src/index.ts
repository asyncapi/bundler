import { readFileSync } from 'fs';
import { toJS, resolve, versionCheck } from './util';
import { Document } from './document';
import { parse } from './parser';

import type { AsyncAPIObject } from './spec-types';

/**
 *
 * @param {string[]} files Array of relative or absolute paths to AsyncAPI
 * Documents that should be bundled.
 * @param {Object} [options]
 * @param {string | object} [options.base] Base object whose properties will be
 * retained.
 * @param {string} [options.baseDir] Relative or absolute path to directory
 * relative to which paths to AsyncAPI Documents that should be bundled will be
 * resolved.
 * @param {boolean} [options.xOrigin] Pass `true` to generate properties
 * `x-origin` that will contain historical values of dereferenced `$ref`s.
 *
 * @return {Document}
 *
 * @example
 *
 ***TypeScript**
 *```ts
 *import { writeFileSync } from 'fs';
 *import bundle from '@asyncapi/bundler';
 *
 *async function main() {
 *  const document = await bundle(['social-media/comments-service/main.yaml'], {
 *    baseDir: 'example-data',
 *    xOrigin: true,
 *  });
 *
 *  console.log(document.yml()); // the complete bundled AsyncAPI document
 *  writeFileSync('asyncapi.yaml', document.yml());  // the complete bundled AsyncAPI document
 *}
 *
 *main().catch(e => console.error(e));
 *```
 *
 ***JavaScript CJS module system**
 *```js
 *'use strict';
 *
 *const { writeFileSync } = require('fs');
 *const bundle = require('@asyncapi/bundler');
 *
 *async function main() {
 *  const document = await bundle(['social-media/comments-service/main.yaml'], {
 *    baseDir: 'example-data',
 *    xOrigin: true,
 *  });
 *  writeFileSync('asyncapi.yaml', document.yml());
 *}
 *
 *main().catch(e => console.error(e));
 *```
 *
 ***JavaScript ESM module system**
 *```js
 *'use strict';
 *
 *import { writeFileSync } from 'fs';
 *import bundle from '@asyncapi/bundler';
 *
 *async function main() {
 *  const document = await bundle(['social-media/comments-service/main.yaml'], {
 *    baseDir: 'example-data',
 *    xOrigin: true,
 *  });
 *  writeFileSync('asyncapi.yaml', document.yml());
 *}
 *
 *main().catch(e => console.error(e));
 *```
 *
 */
export default async function bundle(files: string[], options: any = {}) {
  if (options.baseDir) {
    process.chdir(options.baseDir);
  }

  const readFiles = files.map(file => readFileSync(file, 'utf-8')); // eslint-disable-line

  const parsedJsons = readFiles.map(file => toJS(file)) as AsyncAPIObject[];

  const majorVersion = versionCheck(parsedJsons);

  if (typeof options.base !== 'undefined') {
    options.base = toJS(options.base);
    await parse(options.base, majorVersion, options);
  }

  const resolvedJsons: AsyncAPIObject[] = await resolve(
    parsedJsons,
    majorVersion,
    options
  );

  return new Document(resolvedJsons, options.base);
}

// 'module.exports' is added to maintain backward compatibility with Node.js
// projects, that use CJS module system.
module.exports = bundle;
