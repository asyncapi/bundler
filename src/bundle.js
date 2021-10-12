const { InvalidInputError } = require("./errors");
const {
  resolveFilePaths,
  parseFiles
} = require('./utils');
const _ = require('lodash');

class Bundler {
  
  /**
   * 
   * @param {stringp[]} filepaths 
   */
  async bundle(filepaths){
    if(typeof filepaths !== 'object' && Array.isArray(filepaths)){
      throw new InvalidInputError();
    }
    const resolvedFilePaths = resolveFilePaths(filepaths);
    const files = await parseFiles(resolvedFilePaths);
    const document = _.merge(files.map(file => JSON.parse(file.raw)))
    return document;
  }
}


module.exports = new Bundler();