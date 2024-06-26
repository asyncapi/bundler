import yaml from 'js-yaml';
import { parse } from './parser';
import { ParserError } from './errors';

import type { AsyncAPIObject } from './spec-types';

/**
 * @private
 */
export const toJS = (asyncapiYAMLorJSON: string | object) => {
  if (!asyncapiYAMLorJSON) {
    throw new ParserError({
      type: 'null-or-falsy-document',
      title: "Document can't be null or falsey.", // eslint-disable-line
    });
  }

  if (
    asyncapiYAMLorJSON.constructor &&
    asyncapiYAMLorJSON.constructor.name === 'Object'
  ) {
    return asyncapiYAMLorJSON;
  }

  if (typeof asyncapiYAMLorJSON !== 'string') {
    throw new ParserError({
      type: 'invalid-document-type',
      title: 'The AsyncAPI document has to be either a string or a JS object.',
    });
  }

  if (JSON.stringify(asyncapiYAMLorJSON).trimStart().startsWith('{')) {
    throw new ParserError({
      type: 'invalid-yaml',
      title: 'The provided yaml is not valid.',
    });
  }

  return yaml.load(asyncapiYAMLorJSON);
};

/**
 *
 * @param {Object} asyncapiDocuments
 * @param {Object} options
 * @param {boolean} options.xOrigin
 * @returns {Array<Object>}
 * @private
 */
export const resolve = async (
  asyncapiDocuments: AsyncAPIObject[],
  specVersion: number,
  options: any
) => {
  const docs = [];

  try {
    for (const asyncapiDocument of asyncapiDocuments) {
      await parse(asyncapiDocument, specVersion, options);
      docs.push(asyncapiDocument);
    }
  } catch (e) {} // eslint-disable-line

  return docs;
};

/**
 *
 * @param asyncapiDocument {AsyncAPIObject}
 * @returns {boolean}
 */

export function getSpecVersion(asyncapiDocument: AsyncAPIObject): number {
  const versionString = asyncapiDocument.asyncapi;
  return parseInt(versionString, 10);
}

export function versionCheck(asyncapiDocuments: AsyncAPIObject[]): number {
  let currentVersion = getSpecVersion(asyncapiDocuments[0]);
  for (const asyncapiDocument of asyncapiDocuments) {
    const majorVersion = getSpecVersion(asyncapiDocument);
    if (majorVersion !== currentVersion) {
      throw new Error(
        'Unable to bundle specification file of different major versions'
      );
    }
    currentVersion = majorVersion;
  }
  return currentVersion;
}

export function isExternalReference(ref: string): boolean {
  return typeof ref === 'string' && !ref.startsWith('#');
}
