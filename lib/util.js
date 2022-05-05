const { ParserError } = require("./errors");
const $RefParser = require('@apidevtools/json-schema-ref-parser');
const {parse} = require('./parser');
const yaml = require("js-yaml");
const _ = require('lodash');

exports.toJS = (asyncapiYAMLorJSON) => {
  if (!asyncapiYAMLorJSON) {
    throw new ParserError({
      type: "null-or-falsy-document",
      title: "Document can't be null or falsey.",
    });
  }

  if (
    asyncapiYAMLorJSON.constructor &&
    asyncapiYAMLorJSON.constructor.name === "Object"
  ) {
    return {
      initialFormat: "js",
      parsedJSON: asyncapiYAMLorJSON,
    };
  }

  if (typeof asyncapiYAMLorJSON !== "string") {
    throw new ParserError({
      type: "invalid-document-type",
      title: "The AsyncAPI document has to be either a string or a JS object.",
    });
  }

  if (asyncapiYAMLorJSON.trimLeft().startsWith("{")) {
    throw new ParserError({
      type: 'invalid-yaml',
      title: 'The provided yaml is not valid.'
    })
  }
  return yaml.load(asyncapiYAMLorJSON);
};

exports.validate = async (parsedJSONs, parser) => {
  for (const parsedJSON of parsedJSONs) {
    await parser.parse(_.cloneDeep(parsedJSON));
  }
};

exports.resolve = async (asyncapiDocuments, options = {}) => {
  let docs = [];

  for(const asyncapiDocument of asyncapiDocuments) {
    const bundledAsyncAPIDocument = await $RefParser.bundle(asyncapiDocument);
    docs.push(bundledAsyncAPIDocument);
  }
  return docs;
}