const { ParserError } = require("./errors");
const jsonSchemaParser = require("@apidevtools/json-schema-ref-parser");
const yaml = require("js-yaml");
const _ = require('lodash');

exports.toJS = async (asyncapiYAMLorJSON) => {
  let resolvedJSON;
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
    resolvedJSON = await jsonSchemaParser.dereference(asyncapiYAMLorJSON);
    return {
      initialFormat: "js",
      parsedJSON: resolvedJSON,
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

  resolvedJSON = await jsonSchemaParser.dereference(
    yaml.load(asyncapiYAMLorJSON)
  );
  return {
    initialFormat: 'yaml',
    parsedJSON: resolvedJSON
  };
};

exports.validate = async (parsedJSONs, parser) => {
  for (const { parsedJSON } of parsedJSONs) {
    await parser.parse(_.cloneDeep(parsedJSON));
  }
};
