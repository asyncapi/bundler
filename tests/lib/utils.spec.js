const {toJS} = require('../../lib/util');
const fs = require('fs');
const path = require('path');

describe('toJS ', () => {
  test('should return yaml as initial format', async () => {
    const spec = fs.readFileSync(path.resolve(process.cwd(), './tests/camera.yml'), 'utf-8');
    const parsedJSON = await toJS(spec);
    expect(parsedJSON.initialFormat).toMatch('yaml')
  })
  
})

