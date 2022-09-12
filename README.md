[![AsyncAPI Bundler](./assets/logo.png)](https://www.asyncapi.com)

[![Github license](https://img.shields.io/github/license/asyncapi/bundler)](https://github.com/asyncapi/bundler/blob/main/LICENSE)
[![PR testing - if Node project](https://github.com/asyncapi/bundler/actions/workflows/if-nodejs-pr-testing.yml/badge.svg)](https://github.com/asyncapi/bundler/actions/workflows/if-nodejs-pr-testing.yml)
[![npm](https://img.shields.io/npm/dw/@asyncapi/bundler)](https://www.npmjs.com/package/@asyncapi/bundler)

<!-- toc is generated with GitHub Actions do not remove toc markers  -->

<!-- toc -->

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
  * [Resolving external references into components](#resolving-external-references-into-components)
- [bundle(files, options)](#bundlefiles-options)

<!-- tocstop -->

## Overview
An official library that lets you bundle/merge your specification files into one. AsyncAPI bundler can help you if -

<details>
<summary>your specification file is divided into different smaller files and is using json `$ref` to reference components </summary>

```yaml

# asyncapi.yaml
asyncapi: '2.4.0'
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
asyncapi: 2.4.0
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

# signup.yaml
asyncapi: '2.4.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user Signup

channels:
  user/signedup:
    subscribe:
      message:
        payload:
          type: object
          properties:
            displayName:
              type: string
            email:
              type: string
              format: email


# login.yaml
asyncapi: '2.4.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signup

channels:
  user/loggenin:
    subscribe:
      message:
        payload:
          type: object
          properties:
            displayName:
              type: string

# After combining
# asyncapi.yaml
asyncapi: '2.4.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge for processing user authentication

channles:
  user/signedup:
    subscribe:
      message:
        payload:
          type: object
          properties:
            displayName:
              type: string
            email:
              type: string
              format: email
  user/loggedin:
    subscribe:
      message:
        payload:
          type: object
          properties:
            displayName:
              type: string
```

</details>

<br>

## Installation

```
npm install @asyncapi/bundler
```

## Usage

AsyncAPI-bundler could be easily used within your javascript projects as a Nodejs module.

```js
const bundle = require('@asyncapi/bundler');
const fs = require('fs');
const path = require('path');

const filePaths = ['./camera.yml','./audio.yml']
const document = await bundle(
  filePaths.map(filePath => fs.readFileSync(path.resolve(filePath), 'utf-8')),
  {
    base: fs.readFileSync(path.resolve('./base.yml'), 'utf-8')
  }
);

console.log(document.json()); // the complete bundled asyncapi document.
```

### Resolving external references into components
You can resolve external references by moving them to Messages object, under `compoents/messages`.

<details>
<summary>For Example</summary>

```yml
# asyncapi.yaml
asyncapi: '2.4.0'
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
asyncapi: 2.4.0
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signedup:
    subscribe:
      message:
        $ref: '#/components/messages/UserSignedUp'
components: 
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
```
</details>

</br>

```ts
const bundle = require('@asyncapi/bundler')
const fs = requrie('fs')
const path = require('path')

const document = await bundle(
  fs.readFileSync(path.resolve('./asyncapi.yml'), 'utf-8'),
  { referenceIntoComponents: true }
  );

console.log(document.json()); 
```


<a name="bundle"></a>

## bundle(files, options)
**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Object&gt;</code> | files that are to be bundled |
| options | <code>Object</code> |  |
| options.base | <code>string</code> \| <code>object</code> | base object whose prperties will be retained. |
| options.referenceIntoComponents | <code>boolean<code> | pass true to resovle external references to components. |


