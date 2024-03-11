import $RefParser from '@apidevtools/json-schema-ref-parser';
import { cloneDeep } from 'lodash';
import yaml from 'js-yaml';
import { parse } from './parser';
import { ParserError } from './errors';
import {JSONPath} from 'jsonpath-plus';

import type { AsyncAPIObject } from './spec-types';
import path from 'path';

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
 * @private
 */
export const validate = async (
  parsedJSONs: AsyncAPIObject[],
  parser: { parse(asyncapi: string | any): Promise<any> }
) => {
  for (const parsedJSON of parsedJSONs) {
    await parser.parse(cloneDeep(parsedJSON));
  }
};

/**
 *
 * @param {Object} asyncapiDocuments
 * @param {Object} options
 * @param {boolean} options.referenceIntoComponents
 * @returns {Array<Object>}
 * @private
 */
export const resolve = async (
  asyncapiDocuments: AsyncAPIObject[],
  options: any
) => {
  const docs = [];

  for (const asyncapiDocument of asyncapiDocuments) {
    if (options.referenceIntoComponents) {
      await parse(asyncapiDocument);
    }
    const bundledAsyncAPIDocument = await $RefParser.bundle(asyncapiDocument);
    docs.push(bundledAsyncAPIDocument);
  }

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
      throw new Error('Unable to bundle specification file of different major versions');
    }
    currentVersion = majorVersion;
  }
  return currentVersion;
}

export function isExternalReference(ref: string): boolean {
  return typeof ref === 'string' && !ref.startsWith('#')
}

export function notAUrl(ref: string): boolean {
  try {
    new URL(ref)
    return false
  } catch (error) {
    return true
  }
}

export function resolveBaseFileDir(file: object, baseFileDir: string) {
  /**
   * Update the local refences in a given file with the 
   * absolute file path using the baseDir passed by the 
   * user as an option. 
   */
  JSONPath({
    json: file,
    resultType: 'all',
    path: '$.channels.*.messages.*'
  }).forEach( ({parent, parentProperty}: {parent: any, parentProperty: string}) => {
    const ref = parent[String(parentProperty)]['$ref']
    if (isExternalReference(ref) && notAUrl(ref)) {
      // console.log(ref)
      // console.log(path.resolve(baseFileDir, ref))
      parent[String(parentProperty)]['$ref'] = path.resolve(baseFileDir, ref)
    }
  })

  JSONPath({
    json: file,
    resultType: 'all',
    path: '$.operations.*.messages.*'
  }).forEach(
    ({parent, parentProperty}: {parent: any, parentProperty: string}) => {
    const ref = parent[String(parentProperty)]['$ref']
    if (isExternalReference(ref) && notAUrl(ref)) {
      // console.log(ref)
      // console.log(path.resolve(baseFileDir, ref))
      parent[String(parentProperty)]['$ref'] = path.resolve(baseFileDir, ref)
    }
    }
  )
}