import $RefParser from '@apidevtools/json-schema-ref-parser';
import { Parser } from '@asyncapi/parser';

import type { ParserOptions as $RefParserOptions } from '@apidevtools/json-schema-ref-parser';
import type { AsyncAPIObject } from 'spec-types';

import path from 'path';

const parser = new Parser();

let RefParserOptions: $RefParserOptions;

/**
 * Function fully dereferences the provided AsyncAPI Document.
 * @param {Object[]} JSONSchema
 * @param {number} specVersion
 * @param {string} filePath
 * @param {Object} options
 * @private
 */
export async function parse(
  JSONSchema: AsyncAPIObject,
  specVersion: number,
  filePath: string,
  options: any = {}
) {
  let validationResult: any[] = [];

  /* eslint-disable indent */
  // It is assumed that there will be major Spec versions 4, 5 and on.
  switch (specVersion) {
    case 2:
      RefParserOptions = {
        dereference: {
          circular: false,
          // prettier-ignore
          excludedPathMatcher: (path: string): any => { // eslint-disable-line
            return;
          },
          onDereference: (path: string, value: AsyncAPIObject) => {
            if (options.xOrigin === true) {
              value['x-origin'] = path;
            }
          },
        },
      };
      break;
    case 3:
      RefParserOptions = {
        dereference: {
          circular: false,
          excludedPathMatcher: (path: string): any => {
            return (
              // prettier-ignore
              (/#\/channels\/.*\/servers/).test(path) ||
              (/#\/operations\/.*\/channel/).test(path) ||
              (/#\/operations\/.*\/messages/).test(path) ||
              (/#\/operations\/.*\/reply\/channel/).test(path) ||
              (/#\/operations\/.*\/reply\/messages/).test(path) ||
              (/#\/components\/channels\/.*\/servers/).test(path) ||
              (/#\/components\/operations\/.*\/channel/).test(path) ||
              (/#\/components\/operations\/.*\/messages/).test(path) ||
              (/#\/components\/operations\/.*\/reply\/channel/).test(path) ||
              (/#\/components\/operations\/.*\/reply\/messages/).test(path)
            );
          },
          onDereference: (path: string, value: AsyncAPIObject) => {
            if (options.xOrigin === true) {
              value['x-origin'] = path;
            }
          },
        },
      };
      break;
    default:
      console.error(
        `There is no support for AsyncAPI Specification v${specVersion}.`
      );
  }

  let previousDir: string | null = null;
  if (!options.baseDir) {
    previousDir = process.cwd();
    process.chdir(path.dirname(filePath));
  }

  const dereferencedJSONSchema = await $RefParser.dereference(
    JSONSchema,
    RefParserOptions
  );

  // Option `noValidation: true` is used by the testing system, which
  // intentionally feeds Bundler wrong AsyncAPI Documents, thus it is not
  // documented.
  if (!options.noValidation) {
    validationResult = await parser.validate(
      JSON.parse(JSON.stringify(dereferencedJSONSchema))
    );
  }

  // If Parser's `validate()` function returns a non-empty array with at least
  // one `severity: 0`, that means there was at least one error during
  // validation, not a `warning: 1`, `info: 2`, or `hint: 3`. Thus, array's
  // elements with `severity: 0` are outputted as a list of remarks, and the
  // program exits without doing anything further.
  if (
    validationResult.length !== 0 &&
    validationResult.map(element => element.severity).includes(0)
  ) {
    console.log(
      'Validation of the resulting AsyncAPI Document failed.\nList of remarks:\n',
      validationResult.filter(element => element.severity === 0)
    );
    throw new Error();
  }

  if (previousDir) {
    process.chdir(previousDir);
  }

  return dereferencedJSONSchema;
}
