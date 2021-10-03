const $RefParser = require('@apidevtools/json-schema-ref-parser');
const parser = require('@asyncapi/parser');
const _ = require('lodash');

async function bundle(spec) {
  const doc =  _.cloneDeep(spec)
  await parser.parse(spec);
  return await $RefParser.dereference(doc);
}

module.exports = bundle;