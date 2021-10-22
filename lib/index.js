const { toJS, validate, resolve } = require("./util");
const Document = require("./document");

/**
 *
 * @param {string[] | Object[]} files files that are to be bundled
 * @param {Object} options
 * @param {string | object} options.base base object whose prperties will be retained.
 * @param {Object} options.parser asyncapi parser object
 * @param {boolean} options.validate pass false to not validate file before merge
 */
const bundle = async (files, options = {}) => {
  if (typeof options.base !== "undefined") {
    options.base = toJS(options.base).parsedJSON;
  }

  if (typeof options.parser === "undefined") {
    options.parser = require("@asyncapi/parser");
  }

  if (typeof options.validate === "undefined") {
    options.validate = true;
  }
  const parsedJsons = files.map(file => toJS(file));
  const resolvedJsons = await resolve(parsedJsons);
  
  if (options.validate) {
    await validate(resolvedJsons, options.parser);
  }

  return new Document(parsedJsons, options.base);
};

module.exports = {
  bundle,
};
