const { InvalidInputError } = require("./errors");
const {
  parsedObjects
} = require('./utils');
const _ = require('lodash');
const yaml = require('js-yaml');

class Bundler {
  
  /**
   * 
   * @param {stringp[]} specs 
   * @param {Object} option
   * @param {string} option.base
   */
  async bundle(specs, option){
    if(!Array.isArray(specs) && (typeof specs[0] === 'string' || typeof specs[0] === 'object')) {
      throw new InvalidInputError();
    }
    const documents = await parsedObjects(specs);
    let doc = {};
    documents.forEach(el => {
      doc = _.merge(doc, el.spec);
    })
    if(option.base) {
      doc = _.merge(doc, yaml.load(option.base))
    }
    return doc;
  }
}


module.exports = new Bundler();