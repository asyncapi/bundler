const _ = require('lodash');
const {loadFiles} = require('./file-loader');
const {validateSpecFiles} = require('./validate');

/**
 * 
 * @param {(string | string[])} dirOrFilePath 
 * @param {string} outputPath
 */
async function bundle(dirOrFilePath, outputPath) {
  const specFiles = await loadFiles(dirOrFilePath);
  validateSpecFiles(specFiles);
  
}

module.exports = bundle;