import $RefParser from '@apidevtools/json-schema-ref-parser';
import { Parser } from '@asyncapi/parser';

import { AsyncAPIObject } from 'spec-types';

const parser = new Parser();

export async function parse(JSONSchema: AsyncAPIObject, options: any = {}) {
  let validationResult: any[] = [];

  const dereferencedJSONSchema = await $RefParser.dereference(JSONSchema, {
    dereference: {
      circular: false,
      excludedPathMatcher: (path: string): any => {
        return (
          // prettier-ignore
          /#\/channels\/[a-zA-Z0-9]*\/servers/.test(path) ||
          /#\/operations\/[a-zA-Z0-9]*\/channel/.test(path) ||
          /#\/operations\/[a-zA-Z0-9]*\/messages/.test(path) ||
          /#\/operations\/[a-zA-Z0-9]*\/reply\/channel/.test(path) ||
          /#\/operations\/[a-zA-Z0-9]*\/reply\/messages/.test(path) ||
          /#\/components\/channels\/[a-zA-Z0-9]*\/servers/.test(path) ||
          /#\/components\/operations\/[a-zA-Z0-9]*\/channel/.test(path) ||
          /#\/components\/operations\/[a-zA-Z0-9]*\/messages/.test(path) ||
          /#\/components\/operations\/[a-zA-Z0-9]*\/reply\/channel/.test(path) ||
          /#\/components\/operations\/[a-zA-Z0-9]*\/reply\/messages/.test(path)
        );
      },
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

export async function resolveV3Document(
  asyncapiDocuments: AsyncAPIObject[],
  options: any = {}
) {
  const docs = [];

  // Graceful `return` doesn't stop Bundler from writing an invalid
  // `asyncapi.yaml` (while it should,) thus the full program is abnormally
  // terminated through `try...catch`, which is a forced decision.
  try {
    for (const asyncapiDocument of asyncapiDocuments) {
      await parse(asyncapiDocument, options);
      docs.push(asyncapiDocument);
    }
  } catch (e) {} // eslint-disable-line no-empty

  return docs;
}
