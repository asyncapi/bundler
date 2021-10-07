const _ = require('lodash');
const {loadFiles} = require('./file-loader');
const {validateSpecFiles} = require('./validate');

/**
 * 
 * @param {(string | string[])} dirOrFilePath 
 */
async function bundle(dirOrFilePath) {
  const specFiles = await loadFiles(dirOrFilePath);
  validateSpecFiles(specFiles);
  
}

module.exports = bundle;