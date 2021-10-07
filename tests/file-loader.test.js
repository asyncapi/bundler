const {loadFiles} = require('../src/file-loader');
const {validateSpecFiles} = require('../src/validate');
const {bundleSpec} = require('../src/bundle');
const path = require('path');

describe('loadFiles ', () => {
  test('should return file object', async () => {
   const files = await loadFiles(path.resolve('./tests/specs'));
   await validateSpecFiles(files);
   const doc = await bundleSpec(files);
   console.log(doc);
   expect(files.length).toEqual(2);
  })
    
})
