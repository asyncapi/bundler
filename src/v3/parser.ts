import $RefParser from '@apidevtools/json-schema-ref-parser';
import { JSONPath } from 'jsonpath-plus';
import { merge } from 'lodash';

import { $Refs } from '@apidevtools/json-schema-ref-parser';
import { AsyncAPIObject } from 'spec-types';

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

function crawlChannelPropertiesForRefs(JSONSchema: any) {
  return JSONPath({
    json: JSONSchema,
    path: '$.channels.*.messages.*.[\'$ref\']',
  });
}

export function isExternalReference(ref: string): boolean {
  return typeof ref === 'string' && !ref.startsWith('#');
}

async function resolveExternalRefs(parsedJSON: any, $refs: $Refs) {
  const componentObj: any = { messages: {} };
  JSONPath({
    json: parsedJSON,
    resultType: 'all',
    path: '$.channels.*.messages.*',
  }).forEach(
    ({ parent, parentProperty }: { parent: any; parentProperty: string }) => {
      const ref = parent[String(parentProperty)]['$ref'];
      if (isExternalReference(ref)) {
        const value: any = $refs.get(ref);
        const component = new ExternalComponents(ref, value);
        if (componentObj.messages) {
          componentObj.messages[String(component.getKey())] =
            component.getValue() as unknown;
        }
        parent[String(parentProperty)][
          '$ref'
        ] = `#/components/messages/${component.getKey()}`;
      }
    }
  );

  return componentObj;
}

async function resolveExternalRefsForOperation(parsedJSON: any, $refs: $Refs) {
  JSONPath({
    json: parsedJSON,
    resultType: 'all',
    path: '$.operations.*.messages.*'
  }).forEach(
    ({parent, parentProperty}: {parent: any, parentProperty: string}) => {
      parent.forEach((reference: any) => {
        const ref = reference['$ref'];
        if (isExternalReference(ref)) {
          const value: any = $refs.get(ref);
          const component = new ExternalComponents(ref, value);
          parent[parentProperty]['$ref'] = `#/components/messages/${component.getKey()}`;
        }
      });
    }
  );
}

export async function parse(JSONSchema: any) {
  const $ref: any = await $RefParser.resolve(JSONSchema);
  const refs = crawlChannelPropertiesForRefs(JSONSchema);
  for (const ref of refs) {
    if (isExternalReference(ref)) {
      const componentObj = await resolveExternalRefs(JSONSchema, $ref);
      await resolveExternalRefsForOperation(JSONSchema, $ref);
      if (JSONSchema.components) {
        merge(JSONSchema.components, componentObj);
      } else {
        JSONSchema.components = componentObj;
      }
    }
  }
}

export async function resolveV3Document(asyncapiDocuments: AsyncAPIObject[], options: any) {
  const docs = [];
  for (const asyncapiDocument of asyncapiDocuments) {
    await parse(asyncapiDocument);
    //const bundledAsyncAPIDocument = await $RefParser.bundle(asyncapiDocument)
    docs.push(asyncapiDocument);
  }
  return docs; 
}