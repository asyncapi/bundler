const _ = require('lodash');
const {loadFiles} = require('./file-loader');
const {validateSpecFiles} = require('./validate');
const yaml = require('js-yaml');

module.exports = {
  bundle, 
  bundleSpec
};

/**
 * 
 * @param {(string | string[])} dirOrFilePath 
 * @param {string} outputPath
 */
async function bundle(dirOrFilePath, outputPath) {
  const specFiles = await loadFiles(dirOrFilePath);
  validateSpecFiles(specFiles);
  return bundleSpec(specFiles);
}

async function bundleSpec(files) {
  let doc;
  files.forEach(file => {
    doc = _.merge(doc, yaml.load(file.raw));
  })

  return doc
}