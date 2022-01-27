const _ = require("lodash");
const yaml = require("js-yaml");

/**
 * @class
 */
class Document {
  /**
   * 
   * @param {Object[]} parsedJSONList 
   * @param {Object} [base] 
   */
  constructor(parsedJSONList, base) {
    this._doc = {};
    for (const { parsedJSON } of parsedJSONList) {
      this._doc = _.merge(this._doc, parsedJSON);
    }

    if (typeof base !== "undefined") {
      this._doc = _.merge(this._doc, base);
    }
  }

  /**
   * @return {Object}
   */
  json() {
    return this._doc;
  }

  /**
   * @return {string}
   */
  yml() {
    return yaml.dump(this._doc);
  }

  /**
   * @return {string}
   */
  string(){
    return JSON.stringify(this._doc);
  }
}

module.exports = Document;
