import $RefParser from '@apidevtools/json-schema-ref-parser';
import { cloneDeep } from 'lodash';
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
