export type { AsyncAPIObject } from '@asyncapi/parser/esm/types';

export interface Options {
  base?: string;
  baseDir?: string;
  xOrigin?: boolean;
  noValidation?: boolean; // used by the testing system, thus not documented
}
