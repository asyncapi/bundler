# asyncapi-document-bundler
Combine multiple AsyncAPI spec files into one complete spec file. 

Inspired by [zbos](https://bitbucket.org/qbmt/zbos-mqtt-api/src/master/) where they have multiple specification files for their different interfaces. This is easy to maintain as for a particular interface only that specific specification file is needed, but for the customer they do not care for the granularity and they look at the platform as one, so they need only one specification file. This is what `asyncapi-document-builder` is trying to solve, to provide a way to effectively bundle differnt AsyncAPI specification files. For example check [here](./tests/README.md)

## Usage 

### Using as a CLI 
```
asyncapi-bundle <file-paths> -o <output-path> -b <base-file-path>
```

`Options`
- `-o, --output` - path of the output file
- `-b, --base` - path of the base file. 

### Using as a library

AsyncAPI-bundler could be easily used within your javascript projects as a Nodejs module. 

```js
const bundler = require('asyncapi-bundler');
const fs = require('fs');
const path = require('path');

const filePaths = ['./camera.yml','./audio.yml']
const document = await bundler.bundle(
  filePaths.map(filePath => fs.readFileSync(path.resolve(filePaths), 'utf-8')),
  {
    base: fs.readFileSync(path.resolve('./base.yml'), 'utf-8')
  }
);

console.log(document.json()); // the complete bundled asyncapi document.
```

<a name="bundle"></a>

## bundle(files, options)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Object&gt;</code> | files that are to be bundled |
| options | <code>Object</code> |  |
| options.base | <code>string</code> \| <code>object</code> | base object whose prperties will be retained. |
| options.parser | <code>Object</code> | asyncapi parser object |
| options.validate | <code>boolean</code> | pass false to not validate file before merge |

