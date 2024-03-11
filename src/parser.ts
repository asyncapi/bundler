import $RefParser from '@apidevtools/json-schema-ref-parser';
import { Parser } from '@asyncapi/parser';
import { addXOrigins } from './util';

import { AsyncAPIObject } from 'spec-types';

const parser = new Parser();

/**
 * Resolves external references and updates $refs.
 * @param {Object[]} JSONSchema
 * @private
 */
export async function parse(JSONSchema: AsyncAPIObject) {
  addXOrigins(JSONSchema);

  const dereferencedJSONSchema = await $RefParser.dereference(JSONSchema, {
    dereference: {
      circular: false,
      // excludedPathMatcher: (path: string): boolean => {
      //   return (
      //     // prettier-ignore
      //     !!(/#\/channels\/[a-zA-Z0-9]*\/servers/).exec(path) ||
      //     !!(/#\/operations\/[a-zA-Z0-9]*\/channel/).exec(path) ||
      //     !!(/#\/operations\/[a-zA-Z0-9]*\/messages/).exec(path) ||
      //     !!(/#\/operations\/[a-zA-Z0-9]*\/reply\/channel/).exec(path) ||
      //     !!(/#\/operations\/[a-zA-Z0-9]*\/reply\/messages/).exec(path) ||
      //     !!(/#\/components\/channels\/[a-zA-Z0-9]*\/servers/).exec(path) ||
      //     !!(/#\/components\/operations\/[a-zA-Z0-9]*\/channel/).exec(path) ||
      //     !!(/#\/components\/operations\/[a-zA-Z0-9]*\/messages/).exec(path) ||
      //     !!(/#\/components\/operations\/[a-zA-Z0-9]*\/reply\/channel/).exec(
      //       path
      //     ) ||
      //     !!(/#\/components\/operations\/[a-zA-Z0-9]*\/reply\/messages/).exec(
      //       path
      //     )
      //   );
      // },
    },
  });

  const result = await parser.validate(
    JSON.parse(JSON.stringify(dereferencedJSONSchema))
  );
  
  // If Parser's `validate()` function returns a non-empty array, that means
  // there were errors during validation. Thus, the array is outputted as a list
  // of remarks, and the program exits without doing anything further.
  // if (result.length !== 0) {
  //   console.log(
  //     'Validation of the resulting AsyncAPI Document failed.\nList of remarks:\n',
  //     result
  //   );
  //   throw new Error();
  // }

  return result;
}
