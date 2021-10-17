const {toJS} = require('../../lib/util');
const fs = require('fs');
const path = require('path');

describe('toJS ', () => {
  test('should return yaml as initial format', () => {
    const spec = fs.readFileSync(path.resolve(process.cwd(), './tests/camera.yml'), 'utf-8');
    const parsedJSON = toJS(spec);
    expect(parsedJSON.initialFormat).toMatch('yaml')
  })
  
})

