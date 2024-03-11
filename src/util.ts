import fs from 'fs';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import axios from 'axios';
import { cloneDeep, merge } from 'lodash';
import yaml from 'js-yaml';
import { parse } from './parser';
import { ParserError } from './errors';
import { JSONPath } from 'jsonpath-plus';

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
    addXOrigins(asyncapiDocument); // eslint-disable-line @typescript-eslint/no-use-before-define
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

export function notAUrl(ref: string): boolean {
  try {
    new URL(ref);
    return false;
  } catch (error) {
    return true;
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
    path: '$.channels.*.messages.*',
  }).forEach(
    ({ parent, parentProperty }: { parent: any; parentProperty: string }) => {
      const ref = parent[String(parentProperty)]['$ref'];
      if (isExternalReference(ref) && notAUrl(ref)) {
        parent[String(parentProperty)]['$ref'] = path.resolve(baseFileDir, ref);
      }
    }
  );

  JSONPath({
    json: file,
    resultType: 'all',
    path: '$.operations.*.messages.*',
  }).forEach(
    ({ parent, parentProperty }: { parent: any; parentProperty: string }) => {
      const ref = parent[String(parentProperty)]['$ref'];
      if (isExternalReference(ref) && notAUrl(ref)) {
        parent[String(parentProperty)]['$ref'] = path.resolve(baseFileDir, ref);
      }
    }
  );
}

// Moved 'addXOrigins' to the beginning of the scope to avoid an ESLint's error
// `'addXOrigins' was used before it was defined`
export function addXOrigins(asyncapiDocument: AsyncAPIObject) {
  // VALUE from 'asyncapiDocument' becomes KEY for the
  // underlying and recursive functions
  Object.values(asyncapiDocument).forEach(async (key: any) => {
    if (key && typeof key === 'object' && key !== '$ref') {
      if (Object.keys(key).indexOf('$ref') !== -1) {
        if (isExternalReference(key['$ref'])) {
          key['x-origin'] = key['$ref'];

          // If an external `$ref` is found, the function goes into
          // second-level recursion to see if there are more `$ref`s whose
          // values need to be copied to the `x-origin` properties of the
          // `$ref`ed file.
          // If an external `$ref` is found again, the function goes into the
          // third-level recursion, and so on, until it reaches a file that
          // contains no external `$ref`s at all.
          // Then it exits all the way up in the opposite direction.

          const inlineAsyncapiDocumentURI = key['$ref'].split('#/');
          const inlineAsyncapiDocumentPath = inlineAsyncapiDocumentURI[0];
          const inlineAsyncapiDocumentPointer = inlineAsyncapiDocumentURI[1];

          let inlineAsyncapiDocument = inlineAsyncapiDocumentPath.startsWith(
            'http'
          )
            ? yaml.load(await axios(inlineAsyncapiDocumentPath))
            : (yaml.load(
                fs.readFileSync(inlineAsyncapiDocumentPath, 'utf-8') // eslint-disable-line
              ) as any); // eslint-disable-line

          inlineAsyncapiDocument =
            inlineAsyncapiDocument[String(inlineAsyncapiDocumentPointer)];

          if (inlineAsyncapiDocument) {
            addXOrigins(inlineAsyncapiDocument as AsyncAPIObject);
            merge(key, inlineAsyncapiDocument);
          }
        }
      } else {
        addXOrigins(key);
      }
    }
  });
  return asyncapiDocument;
}
