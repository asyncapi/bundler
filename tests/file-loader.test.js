const {loadFiles} = require('../src/file-loader');
const {validateSpecFiles} = require('../src/validate');
const path = require('path');

describe('loadFiles ', () => {
  test('should return file object', async () => {
   const files = await loadFiles(path.resolve('./tests/specs'));
   await validateSpecFiles(files);
   console.log(files);
   expect(files.length).toEqual(2);
  })
    
})
