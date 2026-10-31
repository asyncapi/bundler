import path from 'path';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { isExternalReference } from './util';

import type {
  $Refs,
  ParserOptions as $RefParserOptions,
} from '@apidevtools/json-schema-ref-parser';
import type { AsyncAPIObject, Options as BundlerOptions } from './spec-types';

let RefParserOptions: $RefParserOptions;

function escapeJsonPointer(segment: string): string {
  return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

function indexObjectsBySourceFile(
  value: any,
  filePath: string,
  map: WeakMap<object, string>,
  seen: Set<object>
) {
  if (!value || typeof value !== 'object' || seen.has(value)) {
    return;
  }
  seen.add(value);
  map.set(value, filePath);
  for (const child of Object.values(value)) {
    indexObjectsBySourceFile(child, filePath, map, seen);
  }
}

function collectRecordTargetPointers(
  record: Record<string, any> | undefined,
  prefix: string,
  map: Map<object, string>
) {
  if (!record || typeof record !== 'object') {
    return;
  }
  for (const [key, val] of Object.entries(record)) {
    if (val && typeof val === 'object' && !map.has(val)) {
      map.set(val, `${prefix}/${escapeJsonPointer(key)}`);
    }
  }
}

function collectChannelTargetPointers(
  channels: Record<string, any> | undefined,
  prefix: string,
  map: Map<object, string>
) {
  if (!channels || typeof channels !== 'object') {
    return;
  }
  for (const [channelKey, channelObj] of Object.entries(channels)) {
    if (channelObj && typeof channelObj === 'object') {
      const channelPointer = `${prefix}/${escapeJsonPointer(channelKey)}`;
      if (!map.has(channelObj)) {
        map.set(channelObj, channelPointer);
      }
      collectRecordTargetPointers(
        channelObj.messages,
        `${channelPointer}/messages`,
        map
      );
    }
  }
}

function buildTargetPointerMap(schema: AsyncAPIObject): Map<object, string> {
  const map = new Map<object, string>();
  const doc = schema as Record<string, any>;
  collectRecordTargetPointers(doc.servers, '#/servers', map);
  collectChannelTargetPointers(doc.channels, '#/channels', map);
  collectRecordTargetPointers(
    doc.components?.servers,
    '#/components/servers',
    map
  );
  collectChannelTargetPointers(
    doc.components?.channels,
    '#/components/channels',
    map
  );
  collectRecordTargetPointers(
    doc.components?.messages,
    '#/components/messages',
    map
  );
  return map;
}

function collectChannelRefs(
  channels: Record<string, any> | undefined,
  refs: Array<{ $ref?: string }>
) {
  for (const channel of Object.values(channels || {})) {
    if (Array.isArray(channel?.servers)) {
      refs.push(...channel.servers);
    }
  }
}

function collectOperationRefs(
  operations: Record<string, any> | undefined,
  refs: Array<{ $ref?: string }>
) {
  for (const operation of Object.values(operations || {})) {
    if (operation?.channel) {
      refs.push(operation.channel);
    }
    if (Array.isArray(operation?.messages)) {
      refs.push(...operation.messages);
    }
    if (operation?.reply?.channel) {
      refs.push(operation.reply.channel);
    }
    if (Array.isArray(operation?.reply?.messages)) {
      refs.push(...operation.reply.messages);
    }
  }
}

function resolveExternalRefObject(
  refObj: { $ref?: string },
  refs: $Refs,
  sourceFileByObject: WeakMap<object, string>,
  pointerByTargetObject: Map<object, string>
) {
  if (
    !refObj ||
    typeof refObj !== 'object' ||
    !isExternalReference(refObj.$ref as string)
  ) {
    return;
  }
  const rawRef = refObj.$ref as string;
  const hashIndex = rawRef.indexOf('#');
  if (hashIndex < 0) {
    return;
  }
  const filePart = rawRef.slice(0, hashIndex);
  const hashPart = rawRef.slice(hashIndex);
  const sourceFile = sourceFileByObject.get(refObj);
  const baseDir = sourceFile ? path.dirname(sourceFile) : process.cwd();
  const resolvedRef = `${path.resolve(baseDir, filePart)}${hashPart}`;
  if (refs.exists(resolvedRef, {})) {
    const targetObj = refs.get(resolvedRef);
    const mappedPointer =
      targetObj && typeof targetObj === 'object'
        ? pointerByTargetObject.get(targetObj)
        : undefined;
    refObj.$ref = mappedPointer || hashPart;
    return;
  }
  refObj.$ref = hashPart;
}

function resolveV3ReferenceObjects(schema: AsyncAPIObject, refs: $Refs) {
  const sourceFileByObject = new WeakMap<object, string>();
  for (const [filePath, fileValue] of Object.entries(refs.values())) {
    if (fileValue && fileValue !== schema) {
      indexObjectsBySourceFile(
        fileValue,
        filePath,
        sourceFileByObject,
        new Set()
      );
    }
  }
  const pointerByTargetObject = buildTargetPointerMap(schema);
  const doc = schema as Record<string, any>;
  const refObjects: Array<{ $ref?: string }> = [];
  collectChannelRefs(doc.channels, refObjects);
  collectChannelRefs(doc.components?.channels, refObjects);
  collectOperationRefs(doc.operations, refObjects);
  collectOperationRefs(doc.components?.operations, refObjects);
  for (const refObj of refObjects) {
    resolveExternalRefObject(
      refObj,
      refs,
      sourceFileByObject,
      pointerByTargetObject
    );
  }
}

/**
 * Function fully dereferences the provided AsyncAPI Document.
 * @param {Object[]} JSONSchema
 * @param {number} specVersion
 * @param {Object} options
 * @private
 */
export async function parse(
  JSONSchema: AsyncAPIObject,
  specVersion: number,
  options: BundlerOptions = {}
) {
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

  const parser = new $RefParser();
  const dereferencedJSONSchema = (await parser.dereference(
    JSONSchema,
    RefParserOptions
  )) as AsyncAPIObject;

  if (specVersion === 3) {
    resolveV3ReferenceObjects(dereferencedJSONSchema, parser.$refs);
  }

  return dereferencedJSONSchema;
}
