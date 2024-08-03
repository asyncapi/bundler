import { readFileSync } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { merge } from 'lodash';
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
    return asyncapiYAMLorJSON as AsyncAPIObject;
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

  return yaml.load(asyncapiYAMLorJSON) as AsyncAPIObject;
};

export function getSpecVersion(asyncapiDocument: AsyncAPIObject): number {
  const versionString = asyncapiDocument.asyncapi;
  return parseInt(versionString, 10);
}

/**
 * @private
 *
 * @param asyncapiDocuments {AsyncAPIObject[]}
 * @returns {boolean}
 */
export function versionCheck(asyncapiDocuments: AsyncAPIObject[]): number {
  let currentVersion = getSpecVersion(asyncapiDocuments[0]);
  for (const asyncapiDocument of asyncapiDocuments) {
    const majorVersion = getSpecVersion(asyncapiDocument);
    if (majorVersion !== currentVersion) {
      throw new Error(
        'Unable to bundle specification files of different major versions'
      );
    }
    currentVersion = majorVersion;
  }
  return currentVersion;
}

export function isExternalReference(ref: string): boolean {
  return typeof ref === 'string' && !ref.startsWith('#');
}

/**
 *
 * @param {string | string[]} files
 * @param {Object} options
 * @returns {Array<Object>}
 * @private
 */
export const resolve = async (files: string | string[], options: any) => {
  const parsedJsons: AsyncAPIObject[] = [];

  for (const file of files) {
    const prevDir = process.cwd();

    let filePath: any = file.split('/');
    filePath.pop();
    filePath = filePath.join('/');

    let readFile: any = readFileSync(file, 'utf-8'); // eslint-disable-line
    readFile = toJS(readFile);

    if (filePath) {
      process.chdir(path.resolve(prevDir, filePath));
    }

    readFile = await parse(readFile, getSpecVersion(readFile), options);

    parsedJsons.push(readFile);

    if (prevDir) {
      process.chdir(prevDir);
    }
  }

  return parsedJsons;
};

export async function mergeIntoBaseFile(
  baseFilePath: string | string[],
  bundledDocument: AsyncAPIObject,
  majorVersion: number,
  options: any = {}
) {
  // The base file's path must be an array of exactly one element to be properly
  // iterated in `resolve()`. Even if it was passed to the main script as a
  // string or an array of several elements.
  const baseFilePathAsArray: string[] = [];

  if (typeof baseFilePath === 'string') {
    baseFilePathAsArray.push(baseFilePath);
  } else if (Array.isArray(baseFilePath) && baseFilePath.length >= 1) {
    baseFilePathAsArray.push(baseFilePath[0]);
  }

  const parsedBaseFile: AsyncAPIObject[] = await resolve(
    baseFilePathAsArray,
    options
  );

  if (majorVersion !== getSpecVersion(parsedBaseFile[0])) {
    throw new Error(
      'Base file has different major version than other specification files'
    );
  }

  return merge(bundledDocument, parsedBaseFile[0]) as AsyncAPIObject;
}

// Purely decorative stuff, just to bring the order of the AsyncAPI Document's
// properties into a familiar form.
export function orderPropsAccToAsyncAPISpec(
  inputAsyncAPIObject: any
): AsyncAPIObject {
  const orderOfPropsAccToAsyncAPISpec = [
    'asyncapi',
    'id',
    'info',
    'defaultContentType',
    'servers',
    'channels',
    'operations',
    'components',
  ];

  const outputAsyncAPIObject: any = {};

  for (const prop of orderOfPropsAccToAsyncAPISpec) {
    if (inputAsyncAPIObject[`${prop}`]) {
      outputAsyncAPIObject[`${prop}`] = structuredClone(
        inputAsyncAPIObject[`${prop}`]
      );
    }
  }

  return outputAsyncAPIObject as AsyncAPIObject;
}
