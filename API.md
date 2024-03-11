## Classes

<dl>
<dt><a href="#Document">Document</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#resolve">resolve</a> ⇒ <code>boolean</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#bundle">bundle(files, [options])</a> ⇒ <code><a href="#Document">Document</a></code></dt>
<dd></dd>
</dl>

<a name="Document"></a>

## Document
**Kind**: global class  

* [Document](#Document)
    * [new Document(parsedJSONList, base)](#new_Document_new)
    * [.json()](#Document+json) ⇒ <code>Object</code>
    * [.yml()](#Document+yml) ⇒ <code>string</code>
    * [.string()](#Document+string) ⇒ <code>string</code>

<a name="new_Document_new"></a>

### new Document(parsedJSONList, base)

| Param | Type |
| --- | --- |
| parsedJSONList | <code>Array.&lt;Object&gt;</code> | 
| base | <code>Object</code> | 

**Example**  
```js
const document = new Document(parsedJSONList, base);

console.log(document.json()); // get JSON object
console.log(document.yml()); // get YAML string
console.log(document.string()); // get JSON string
```
<a name="Document+json"></a>

### document.json() ⇒ <code>Object</code>
**Kind**: instance method of [<code>Document</code>](#Document)  
<a name="Document+yml"></a>

### document.yml() ⇒ <code>string</code>
**Kind**: instance method of [<code>Document</code>](#Document)  
<a name="Document+string"></a>

### document.string() ⇒ <code>string</code>
**Kind**: instance method of [<code>Document</code>](#Document)  
<a name="resolve"></a>

## resolve ⇒ <code>boolean</code>
**Kind**: global variable  

| Param | Type |
| --- | --- |
| asyncapiDocument | <code>AsyncAPIObject</code> | 

<a name="bundle"></a>

## bundle(files, [options]) ⇒ [<code>Document</code>](#Document)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array.&lt;string&gt;</code> | <p>Array of stringified AsyncAPI documents in YAML format, that are to be bundled (or array of filepaths, resolved and passed via <code>Array.map()</code> and <code>fs.readFileSync</code>, which is the same, see <code>README.md</code>).</p> |
| [options] | <code>Object</code> |  |
| [options.base] | <code>string</code> \| <code>object</code> | <p>Base object whose properties will be retained.</p> |
| [options.referenceIntoComponents] | <code>boolean</code> | <p>Pass <code>true</code> to resolve external references to components.</p> |
| [options.baseDir] | <code>string</code> | <p>Pass folder path to</p> |

**Example**  
**TypeScript**
```ts
import { readFileSync, writeFileSync } from 'fs';
import bundle from '@asyncapi/bundler';

async function main() {
  const document = await bundle([readFileSync('./main.yaml', 'utf-8')], {
    referenceIntoComponents: true,
  });

  console.log(document.yml()); // the complete bundled AsyncAPI document
  writeFileSync('asyncapi.yaml', document.yml());  // the complete bundled AsyncAPI document
}

main().catch(e => console.error(e));
```

**JavaScript CJS module system**
```js
'use strict';

const { readFileSync, writeFileSync } = require('fs');
const bundle = require('@asyncapi/bundler');

async function main() {
  const document = await bundle([readFileSync('./main.yaml', 'utf-8')], {
    referenceIntoComponents: true,
  });
  writeFileSync('asyncapi.yaml', document.yml());
}

main().catch(e => console.error(e));
```

**JavaScript ESM module system**
```js
'use strict';

import { readFileSync, writeFileSync } from 'fs';
import bundle from '@asyncapi/bundler';

async function main() {
  const document = await bundle([readFileSync('./main.yaml', 'utf-8')], {
    referenceIntoComponents: true,
  });
  writeFileSync('asyncapi.yaml', document.yml());
}

main().catch(e => console.error(e)); 
```
