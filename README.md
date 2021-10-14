# asyncapi-document-bundler
Bundle multiple AsyncAPI spec files into one complete spec file. To learn more about the usecase visit [example](./tests).

## Usage 

### Using as a CLI 
```
asyncapi-bundle <folder-path | file-paths> -o <output-path>
```

### Using as a library

AsyncAPI-bundler could be easily used within your javascript projects as a Nodejs module. 

```js
const bundler = require('asyncapi-bundler');

const doc = await bundler.bundle([
  './light.yml',
  './tube.yml'
]);

console.log(doc); // the complete bundled asyncapi document.
```