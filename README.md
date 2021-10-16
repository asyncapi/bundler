# asyncapi-document-bundler
Bundle multiple AsyncAPI spec files into one complete spec file. Inspired by [zbos](https://bitbucket.org/qbmt/zbos-mqtt-api/src/master/) where they have multiple specification files for their different interfaces. This is easy to maintain as for a particular interface only that specific specification file is needed, but for the customer they do not care for the granularity and they look at the platform as one, so they need only one specification file. This is what `asyncapi-document-builder` is trying to solve, to provide a way to effectively bundle differnt AsyncAPI specification files. For example check [here](./tests/README.md)

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