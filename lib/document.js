const _ = require("lodash");
const yaml = require("js-yaml");

class Document {
  constructor(parsedJSONList, base) {
    this._doc = {};
    for (const { parsedJSON } of parsedJSONList) {
      this._doc = _.merge(this._doc, parsedJSON);
    }

    if (typeof base !== "undefined") {
      this._doc = _.merge(this._doc, base);
    }
  }

  json() {
    return this._doc;
  }

  yml() {
    return yaml.dump(this._doc);
  }

  string(){
    return JSON.stringify(this._doc);
  }
}

module.exports = Document;
