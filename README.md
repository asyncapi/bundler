<h5 align="center">
  <br>
  <a href="https://www.asyncapi.org"><img src="https://github.com/asyncapi/parser-nodejs/raw/master/assets/logo.png" alt="AsyncAPI logo" width="200"></a>
  <br>
  AsyncAPI Bundler
</h5>
<p align="center">
  <em>Bundle multiple Specificatin files into one</em>
</p>

<p align="center">
<a href="https://github.com/asyncapi/bundler/blob/main/LICENSE"><img alt="GitHub license" src="https://img.shields.io/github/license/asyncapi/bundler"></a>
<a href="https://github.com/asyncapi/bundler/actions/workflows/if-nodejs-pr-testing.yml">
<img src="https://github.com/asyncapi/bundler/actions/workflows/if-nodejs-pr-testing.yml/badge.svg" alt="PR testing - if Node project"  />
</a>
<a href="https://www.npmjs.com/package/@asyncapi/bundler">
<img alt="npm" src="https://img.shields.io/npm/dw/@asyncapi/bundler">
</a>

</p>


## Overview 
An official library that lets you bundle/merge your specification files into one. AsyncAPI bundler can help you if - 

<details>
<summary>your specification file is divided into different smaller files and is using json `$ref` to reference components </summary>

```yaml

# asyncapi.yaml
asyncapi: '2.2.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signup:
    subscribe:
      message:
        $ref: './messages.yaml#/messages/UserSignedUp'

#messages.yaml
messages:
  UserSignedUp:
    payload:
      type: object
      properties:
        displayName:
          type: string
          description: Name of the user
        email:
          type: string
          format: email
          description: Email of the user

# After combining 
asyncapi: 2.2.0
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signedup:
    subscribe:
      message:
        payload:
          type: object
          properties:
            displayName:
              type: string
              description: Name of the user
            email:
              type: string
              format: email
              description: Email of the user

```

</details>

<details>
<summary>you have different standalone specification files that define a larger system, see examples here </summary>

```yaml

#

```

</details>




## Installation 

```
npm install @asyncapi/bundler
```

## Usage 

AsyncAPI-bundler could be easily used within your javascript projects as a Nodejs module. 

```js
const bundler = require('@asyncapi/bundler');
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

