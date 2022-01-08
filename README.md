<h5 align="center">
  <br>
  <a href="https://www.asyncapi.org"><img src="https://github.com/asyncapi/parser-nodejs/raw/master/assets/logo.png" alt="AsyncAPI logo" width="200"></a>
  <br>
  AsyncAPI Bundler
</h5>
<p align="center">
  <em>Bundle multiple Specificatin files into one</em>
</p>



## What does Bundler do?
Combine multiple AsyncAPI spec files into one complete spec file or resolve external `$ref`'s in one file. 

As of now you can use AsyncAPI Bundler for two specific use cases - 
- Merge different AsyncAPI specifications into one. 
- Resolve all references from an single AsyncAPI document into a single file. 

## Usage 

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

