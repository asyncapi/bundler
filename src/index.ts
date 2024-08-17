import path from 'path';
import { merge } from 'lodash';
import { Parser } from '@asyncapi/parser';
import {
  resolve,
  versionCheck,
  orderPropsAccToAsyncAPISpec,
  mergeIntoBaseFile,
} from './util';

import { Document } from './document';

import type { AsyncAPIObject, Options } from './types';

// remember the directory where execution of the program started
const originDir = String(process.cwd());

/**
 *
 * @param {string | string[]} files One or more relative/absolute paths to
 * AsyncAPI Documents that should be bundled.
 * @param {Object} [options]
 * @param {string} [options.base] One relative/absolute path to base object whose
 * properties will be retained.
 * @param {string} [options.baseDir] One relative/absolute path to directory
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
export default async function bundle(
  files: string[] | string,
  options: Options = {}
) {
  let bundledDocument: any = {};
  let validationResult: any = [];

  const parser = new Parser();

  // if one string was passed, convert it to an array
  if (typeof files === 'string') {
    files = Array.from(files.split(' '));
  }

  if (options.baseDir && typeof options.baseDir === 'string') {
    process.chdir(path.resolve(originDir, options.baseDir));
  } else if (options.baseDir && Array.isArray(options.baseDir)) {
    process.chdir(path.resolve(originDir, String(options.baseDir[0]))); // guard against passing an array
  }

  const parsedJsons: AsyncAPIObject[] = await resolve(files, options);

  const majorVersion = versionCheck(parsedJsons);

  for (const parsedJson of parsedJsons) {
    bundledDocument = merge(bundledDocument, parsedJson);
  }

  if (options.base) {
    bundledDocument = await mergeIntoBaseFile(
      options.base,
      bundledDocument,
      majorVersion,
      options
    );
  }

  // Purely decorative stuff, just to bring the order of the AsyncAPI Document's
  // properties into a familiar form.
  bundledDocument = orderPropsAccToAsyncAPISpec(bundledDocument);

  // Option `noValidation: true` is used by the testing system, which
  // intentionally feeds Bundler wrong AsyncAPI Documents, thus it is not
  // documented.
  if (!options.noValidation) {
    validationResult = await parser.validate(
      JSON.parse(JSON.stringify(bundledDocument))
    );
  }

  // If Parser's `validate()` function returns a non-empty array with at least
  // one `severity: 0`, that means there was at least one error during
  // validation, not a `warning: 1`, `info: 2`, or `hint: 3`. Thus, array's
  // elements with `severity: 0` are outputted as a list of remarks, and the
  // program throws.
  if (
    validationResult.length !== 0 &&
    validationResult.map((element: any) => element.severity).includes(0)
  ) {
    console.log(
      'Validation of the resulting AsyncAPI Document failed.\nList of remarks:\n',
      validationResult.filter((element: any) => element.severity === 0)
    );
    throw new Error();
  }

  // return to the starting directory before finishing the execution
  if (options.baseDir) {
    process.chdir(originDir);
  }

  return new Document(bundledDocument as AsyncAPIObject);
}

// 'module.exports' is added to maintain backward compatibility with Node.js
// projects, that use CJS module system.
module.exports = bundle;
