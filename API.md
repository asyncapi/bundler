## Classes

<dl>
<dt><a href="#Document">Document</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#validate">validate</a> ⇒ <code>Array.&lt;Object&gt;</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#bundle">bundle(files, [options])</a> ⇒ <code><a href="#Document">Document</a></code></dt>
<dd></dd>
<dt><a href="#isExternalReference">isExternalReference(ref)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks if <code>ref</code> is an external reference.</p></dd>
<dt><a href="#resolveExternalRefs">resolveExternalRefs(parsedJSON, $refs)</a> ⇒ <code>ExternalComponents</code></dt>
<dd></dd>
<dt><a href="#parse">parse(JSONSchema)</a></dt>
<dd><p>Resolves external references and updates $refs.</p></dd>
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
<a name="validate"></a>

## validate ⇒ <code>Array.&lt;Object&gt;</code>
**Kind**: global variable  

| Param | Type |
| --- | --- |
| asyncapiDocuments | <code>Object</code> | 
| options | <code>Object</code> | 
| options.referenceIntoComponents | <code>boolean</code> | 

<a name="bundle"></a>

## bundle(files, [options]) ⇒ [<code>Document</code>](#Document)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array.&lt;string&gt;</code> | <p>Array of stringified AsyncAPI documents in YAML format, that are to be bundled (or array of filepaths, resolved and fed through <code>Array.map()</code> and <code>fs.readFileSync</code>, which is the same, see <code>README.md</code>).</p> |
| [options] | <code>Object</code> |  |
| [options.base] | <code>string</code> \| <code>object</code> | <p>Base object whose properties will be retained.</p> |
| [options.referenceIntoComponents] | <code>boolean</code> | <p>Pass <code>true</code> to resolve external references to components.</p> |

**Example**  
```js
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
<a name="bundle..resolvedJsons"></a>

### bundle~resolvedJsons
<p>Bundle all external references for each file.</p>

**Kind**: inner constant of [<code>bundle</code>](#bundle)  
<a name="isExternalReference"></a>

## isExternalReference(ref) ⇒ <code>boolean</code>
<p>Checks if <code>ref</code> is an external reference.</p>

**Kind**: global function  

| Param | Type |
| --- | --- |
| ref | <code>string</code> | 

<a name="resolveExternalRefs"></a>

## resolveExternalRefs(parsedJSON, $refs) ⇒ <code>ExternalComponents</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| parsedJSON | <code>Array.&lt;Object&gt;</code> | 
| $refs | <code>$RefParser</code> | 

<a name="parse"></a>

## parse(JSONSchema)
<p>Resolves external references and updates $refs.</p>

**Kind**: global function  

| Param | Type |
| --- | --- |
| JSONSchema | <code>Array.&lt;Object&gt;</code> | 

