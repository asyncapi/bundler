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
    const documents = await parsedObjects(specs);
    return _.merge(documents.map(doc => doc.spec));
  }
}


module.exports = new Bundler();