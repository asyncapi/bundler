import { merge } from 'lodash';
import yaml from 'js-yaml';

import { AsyncAPIObject } from '../types';

export interface Document {
  _doc: AsyncAPIObject;
}

/**
 * @class
 *
 * @example
 *
 * const document = new Document(parsedJSONList, base);
 *
 * console.log(document.json()); // get json object
 * console.log(document.yml()); // get yaml string
 * console.log(document.string()); // get json string
 */

export class Document {
  /**
   *
   * @param {Object[]} parsedJSONList
   * @param {Object} base
   */
  constructor(parsedJSONList: AsyncAPIObject[], base: AsyncAPIObject) {
    for (const resolvedJSON of parsedJSONList) {
      this._doc = merge(this._doc, resolvedJSON);
    }

    if (typeof base !== 'undefined') {
      this._doc = merge(this._doc, base);
    }
  }

  /**
   * @return {Object}
   */
  json() {
    return this._doc;
  }

  /**
   * @return {string}
   */
  yml() {
    return yaml.dump(this._doc);
  }

  /**
   * @return {string}
   */
  string() {
    return JSON.stringify(this._doc);
  }
}
