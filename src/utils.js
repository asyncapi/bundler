const path = require('path');
const fs = require('fs');
const parser = require('@asyncapi/parser');

const { InvalidFilePathError } = require('./errors');
/**
 * 
 * @param {string[]} filepaths 
 */
exports.resolveFilePaths = (filepaths) => {
  const resolvedFilepaths = [];
  for(const filepath in filepaths) {
    let resolvedFilePath = path.resolve(filepath);
    if(!fs.existsSync(resolvedFilePath)) {
      throw new InvalidFilePathError(resolvedFilePath);
    }
      resolvedFilepaths.push(resolvedFilePath);
  }

  return resolvedFilepaths;
}

/**
 * 
 * @param {string[]} filepaths 
 */
exports.parseFiles = async (filepaths) => {
  const files = [];
  try {
    for (const file of  filepaths) {
      const doc = await parser.parse(file);
      files.push({
        filename: path.basename(file),
        extension: path.extname(file),
        fullPath: path.resolve(file),
        raw: fs.readFileSync(file, 'utf-8'),
        parsed: doc
      })
    }
    return files;
  } catch (error) {
    throw error;
  }
}