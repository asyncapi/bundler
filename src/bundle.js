const $RefParser = require('@apidevtools/json-schema-ref-parser');

async function bundle(spec) {
  return await $RefParser.dereference(spec);
}

module.exports = bundle;