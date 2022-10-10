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
- [bundle(files, [options])](#bundlefiles-options)

<!-- tocstop -->

## Overview
An official library that lets you bundle/merge your specification files into one. AsyncAPI Bundler can help you if:

<details>
<summary>your specification file is divided into different smaller files and is using JSON `$ref` property to reference components </summary>

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

# messages.yaml
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

AsyncAPI Bundler can be easily used within your JavaScript projects as a Node.js module:

```ts
import { readFileSync, writeFileSync } from 'fs';
import bundle from '@asyncapi/bundler';

async function main() {
  const filePaths = ['./camera.yml','./audio.yml'];
  const document = await bundle(
    filePaths.map(filePath => readFileSync(filePath, 'utf-8')), {
      base: readFileSync('./base.yml', 'utf-8'),
    }
  );

  console.log(document.yml()); // the complete bundled AsyncAPI document
  writeFileSync('asyncapi.yaml', document.yml()); // the complete bundled AsyncAPI document
}

main().catch(e => console.error(e));
```

### Resolving external references into components
You can resolve external references by moving them to Messages Object, under `components/messages`.

<details>
<summary>For example</summary>

```yml
# main.yaml
asyncapi: 2.5.0
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signedup:
    subscribe:
      message:
        $ref: './messages.yaml#/messages/UserSignedUp'
  test:
    subscribe:
      message:
        $ref: '#/components/messages/TestMessage'
components:
  messages:
    TestMessage:
      payload:
        type: string

# messages.yaml
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
  UserLoggedIn:
    payload:
      type: object
      properties:
        id: string

# After combining
# asyncapi.yaml
asyncapi: 2.5.0
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signedup:
    subscribe:
      message:
        $ref: '#/components/messages/UserSignedUp'
  test:
    subscribe:
      message:
        $ref: '#/components/messages/TestMessage'
components:
  messages:
    TestMessage:
      payload:
        type: string
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


<a name="bundle"></a>

## bundle(files, [options])
**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array.&lt;string&gt; | Array of stringified AsyncAPI documents in YAML format, that are to be bundled (or array of filepaths, resolved and passed via `Array.map()` and `fs.readFileSync`, which is the same). |
| [options] | <code>Object</code> |  |
| [options.base] | <code>string</code> \| <code>object</code> | Base object whose properties will be retained. |
| [options.referenceIntoComponents] | <code>boolean<code> | Pass `true` to resolve external references to components. |
