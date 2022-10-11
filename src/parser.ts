import $RefParser from '@apidevtools/json-schema-ref-parser';
import { JSONPath } from 'jsonpath-plus';
import { merge } from 'lodash';

import type { $Refs } from '@apidevtools/json-schema-ref-parser';
import type { AsyncAPIObject, ComponentsObject, MessageObject } from './spec-types';

/**
 * @class
 * @private
 */
class ExternalComponents {
  ref;
  resolvedJSON;
  constructor(ref: string, resolvedJSON: string) {
    this.ref = ref;
    this.resolvedJSON = resolvedJSON;
  }

  getKey() {
    const keys = this.ref.split('/');
    return keys[keys.length - 1];
  }

  getValue() {
    return this.resolvedJSON;
  }
}

/**
 * @private
 */
function crawlChannelPropertiesForRefs(JSONSchema: AsyncAPIObject) {
  // eslint-disable-next-line
  return JSONPath({ json: JSONSchema, path: `$.channels.*.*.message['$ref']` });
}

/**
 * Checks if `ref` is an external reference.
 * @param {string} ref
 * @returns {boolean}
 * @private
 */
function isExternalReference(ref: string) {
  return !ref.startsWith('#');
}

/**
 *
 * @param {Object[]} parsedJSON
 * @param {$RefParser} $refs
 * @returns {ExternalComponents}
 * @private
 */
async function resolveExternalRefs(parsedJSON: AsyncAPIObject, $refs: $Refs) {
  const componentObj: ComponentsObject = { messages: {} };
  JSONPath({
    json: parsedJSON,
    resultType: 'all',
    path: '$.channels.*.*.message',
  }).forEach(
    ({ parent, parentProperty }: { parent: any; parentProperty: string }) => {
      const ref = parent[String(parentProperty)]['$ref'];
      if (isExternalReference(ref)) {
        const value: any = $refs.get(ref);
        const component = new ExternalComponents(ref, value);
        if (componentObj.messages) {
          componentObj.messages[String(component.getKey())] =
            component.getValue() as unknown as MessageObject;
        }
        parent[String(parentProperty)][
          '$ref'
        ] = `#/components/messages/${component.getKey()}`;
      }
    }
  );
  return componentObj;
}

/**
 * Resolves external references and updates $refs.
 * @param {Object[]} JSONSchema
 * @private
 */
export async function parse(JSONSchema: AsyncAPIObject) {
  const $ref: any = await $RefParser.resolve(JSONSchema);
  const refs = crawlChannelPropertiesForRefs(JSONSchema);
  for (const ref of refs) {
    if (isExternalReference(ref)) {
      const componentObject = await resolveExternalRefs(JSONSchema, $ref);
      if (JSONSchema.components) {
        merge(JSONSchema.components, componentObject);
      } else {
        JSONSchema.components = componentObject;
      }
    }
  }
}
