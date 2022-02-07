## Classes

<dl>
<dt><a href="#Document">Document</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#bundle">bundle(files, options)</a> ⇒ <code><a href="#Document">Document</a></code></dt>
<dd></dd>
</dl>

<a name="Document"></a>

## Document
**Kind**: global class  

* [Document](#Document)
    * [new Document(parsedJSONList, [base])](#new_Document_new)
    * [.json()](#Document+json) ⇒ <code>Object</code>
    * [.yml()](#Document+yml) ⇒ <code>string</code>
    * [.string()](#Document+string) ⇒ <code>string</code>

<a name="new_Document_new"></a>

### new Document(parsedJSONList, [base])

| Param | Type |
| --- | --- |
| parsedJSONList | <code>Array.&lt;Object&gt;</code> | 
| [base] | <code>Object</code> | 

**Example**  
```js
const document = new Document(parsedJSONList, base);

console.log(document.json()); // get json object
console.log(document.yml()); // get yaml string
console.log(document.string()); // get json string
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
<a name="bundle"></a>

## bundle(files, options) ⇒ [<code>Document</code>](#Document)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Object&gt;</code> | files that are to be bundled |
| options | <code>Object</code> |  |
| options.base | <code>string</code> \| <code>object</code> | base object whose prperties will be retained. |
| options.parser | <code>Object</code> | asyncapi parser object |
| options.validate | <code>boolean</code> | pass false to not validate file before merge |

**Example**  
```js
const bundler = requrie('@asyncapi/bundler');
const fs = require('fs');
const path = requrie('path');

const document = await bundler.bundle(fs.readFileSync(
  path.resolve('./asyncapi.yaml', 'utf-8')
));

console.log(document.yml());
```
