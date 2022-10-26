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
- [Contributors](#contributors)

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

```js
'use strict';

const { readFileSync, writeFileSync } = require('fs');
const bundle = require('@asyncapi/bundler');

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
<br />

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

<a name="bundle"></a>

## bundle(files, [options])
**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| files | <code>Array.&lt;string&gt; | Array of stringified AsyncAPI documents in YAML format, that are to be bundled (or array of filepaths, resolved and passed via `Array.map()` and `fs.readFileSync`, which is the same). |
| [options] | <code>Object</code> |  |
| [options.base] | <code>string</code> \| <code>object</code> | Base object whose properties will be retained. |
| [options.referenceIntoComponents] | <code>boolean<code> | Pass `true` to resolve external references to components. |

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/Souvikns"><img src="https://avatars.githubusercontent.com/u/41781438?v=4?s=100" width="100px;" alt=""/><br /><sub><b>souvik</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=Souvikns" title="Code">💻</a> <a href="#ideas-Souvikns" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-Souvikns" title="Design">🎨</a> <a href="https://github.com/asyncapi/bundler/pulls?q=is%3Apr+reviewed-by%3ASouvikns" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-Souvikns" title="Maintenance">🚧</a> <a href="https://github.com/asyncapi/bundler/commits?author=Souvikns" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/magicmatatjahu"><img src="https://avatars.githubusercontent.com/u/20404945?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Maciej Urbańczyk</b></sub></a><br /><a href="#ideas-magicmatatjahu" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/asyncapi/bundler/pulls?q=is%3Apr+reviewed-by%3Amagicmatatjahu" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/toukirkhan"><img src="https://avatars.githubusercontent.com/u/88899011?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mohd Toukir Khan</b></sub></a><br /><a href="#infra-toukirkhan" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/MrYugs"><img src="https://avatars.githubusercontent.com/u/5838714?v=4?s=100" width="100px;" alt=""/><br /><sub><b>MrYugs</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=MrYugs" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/amanbedi1"><img src="https://avatars.githubusercontent.com/u/82234871?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Amanpreet Singh Bedi</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=amanbedi1" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/hillariter"><img src="https://avatars.githubusercontent.com/u/7823186?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alexey Vasilevich</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=hillariter" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/aeworxet"><img src="https://avatars.githubusercontent.com/u/16149591?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Viacheslav Turovskyi</b></sub></a><br /><a href="https://github.com/asyncapi/bundler/commits?author=aeworxet" title="Code">💻</a> <a href="#infra-aeworxet" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/asyncapi/bundler/commits?author=aeworxet" title="Documentation">📖</a></td>
    <td align="center"><a href="https://www.brainfart.dev/"><img src="https://avatars.githubusercontent.com/u/6995927?s=400&amp;u=70200e882bc86db94917031d3ced1e805ebe07ab&amp;v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lukasz Gornicki</b></sub></a><br /><a href="#infra-derberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/asyncapi/bundler/pulls?q=is%3Apr+reviewed-by%3Aderberg" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!