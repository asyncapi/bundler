import { toJS, resolve } from './util';
import { Document } from './document';

import { AsyncAPIObject } from '../types';

/**
 *
 * @param {string[]} files Array of stringified AsyncAPI documents in YAML format, that are to be bundled.
 * @param {Object} [options]
 * @param {string | object} [options.base] Base object whose properties will be retained.
 * @param {boolean} [options.referenceIntoComponents] Pass `true` to resolve external references to components.
 *
 * @return {Document}
 *
 * @example
 *
 * const bundle = require('@asyncapi/bundler');
 * const fs = require('fs');
 * const path = require('path');
 *
 * const document = await bundle(fs.readFileSync(
 *   path.resolve('./asyncapi.yaml', 'utf-8')
 * ));
 *
 * console.log(document.yml());
 */
export const bundle = async (files: string[], options: any = {}) => {
  if (typeof options.base !== 'undefined') {
    options.base = toJS(options.base);
  }

  const parsedJsons = files.map(file => toJS(file)) as AsyncAPIObject[];
  
  /**
   * Bundle all external references for each file.
   */
  const resolvedJsons = await resolve(parsedJsons, {
    referenceIntoComponents: options.referenceIntoComponents,
  });

  return new Document(resolvedJsons as AsyncAPIObject[], options.base);
};
