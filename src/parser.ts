import $RefParser from '@apidevtools/json-schema-ref-parser';
import { Parser } from '@asyncapi/parser';

import { AsyncAPIObject } from 'spec-types';

const parser = new Parser();

/**
 * Fully dereferences the AsyncAPI Document.
 * @param {Object[]} JSONSchema
 * @private
 */
export async function parse(JSONSchema: AsyncAPIObject, options: any = {}) {
  let validationResult: any[] = [];

  const dereferencedJSONSchema = await $RefParser.dereference(JSONSchema, {
    dereference: {
      circular: false,
      // excludedPathMatcher: (path: string): any => {
      //   return (
      //     // prettier-ignore
      //   );
      // },
      onDereference: (path: string, value: AsyncAPIObject) => {
        if (options['x-origin']) {
          value['x-origin'] = path;
        }
      },
    },
  });

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

  return dereferencedJSONSchema;
}
