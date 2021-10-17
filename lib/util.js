const { ParserError } = require("./errors");
const yaml = require("js-yaml");

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

  if (!asyncapiYAMLorJSON.trimLeft().startsWith("{")) {
    try {
      return {
        initialFormat: "yaml",
        parsedJSON: yaml.load(asyncapiYAMLorJSON),
      };
    } catch (error) {
      throw new ParserError({
        type: "invalid-yaml",
        title: "The provided YAML is not valid.",
      });
    }
  }
};

exports.validate = async (parsedJSONs, parser) => {
  for (const { parsedJSON } of parsedJSONs) {
    await parser.parse({ ...parsedJSON });
  }
};
