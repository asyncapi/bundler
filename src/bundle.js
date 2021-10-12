const { InvalidInputError } = require("./errors");
const {
  parsedObjects
} = require('./utils');
const _ = require('lodash');

class Bundler {
  
  /**
   * 
   * @param {stringp[]} specs 
   */
  async bundle(specs){
    if(!Array.isArray(specs) && (typeof specs[0] === 'string' || typeof specs[0] === 'object')) {
      throw new InvalidInputError();
    }
    const documents = await parsedObjects(specs);
    let doc = {};
    documents.forEach(el => {
      doc = _.merge(doc, el.spec);
    })
    return doc;
  }
}


module.exports = new Bundler();