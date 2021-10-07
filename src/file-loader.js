/**
 * We need to load all the json or yml file from a directory 
 * or a list of files from the input
 * 
 * FileLoader class only loads file content. 
 */

const fs = require('fs');
const path = require('path');
const recursivedir = require('recursive-readdir');

module.exports = {
  loadFiles
}

/**
 * 
 * @param {(string | string[])} dirOrFilePaths 
 * 
 */
async function loadFiles(dirOrFilePaths){
  let filePaths;
  if(Array.isArray(dirOrFilePaths)) {
    filePaths = dirOrFilePaths;
  }
  if(dirOrFilePaths && typeof dirOrFilePaths === 'string') {
    filePaths = await readJsonOrYmlFile(dirOrFilePaths);
  }

  return filePaths.map(file => ({
    fullpath: path.resolve(file),
    filename: path.basename(file),
    extension: path.extname(file),
    raw: fs.readFileSync(path.resolve(file), 'utf-8')
  }))

}

const readJsonOrYmlFile = async (dirPath) => {
  const files = await recursivedir(dirPath);
  return files.filter(file => path.extname(file) === '.json' || path.extname(file) === '.yml' || path.extname(file) === '.yaml');
}

