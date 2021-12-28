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
- Resolve all references from an single AsyncAPI docuement into a single file. 

## Usage 

### Using as a CLI 
```
asyncapi-bundle <file-paths> -o <output-path> -b <base-file-path>
```

`Options`
- `-o, --output` - path of the output file
- `-b, --base` - path of the base file. 

#### Examples 

<details>
<summary><b>Merge multiple AsyncAPI documents into one</b></summary>

**CLI command**
```
asyncapi-bundle ./camera.yml ./audio.yml -b ./base.yml -o all.yml
```

**Files**
```yml
#audio.yml
asyncapi: 2.0.0
id: 'urn:zbos-mqtt-api'
defaultContentType: application/json
info:
  title: Audio
  version: 2.6.3
  description: API for communication with ZBOS by Zora Robotics.
  contact:
    email: info@zorarobotics.be
channels:
  zbos/audio/player/start:
    publish:
      summary: Play media
      description: |
        Play specific media from audio options
      tags:
        - name: Audio
          description: All audio related topics.
      message:
        payload:
          type: object
          properties:
            requestId:
              type: string
            url:
              type: string
            loop:
              type: boolean
        name: AudioOptions
        examples:
          - payload:
              requestId: '1'
              url: Url
              loop: true
  zbos/audio/player/stop:
    publish:
      summary: Stop media
      description: ''
      tags:
        - name: Audio
          description: All audio related topics.
      message:
        $ref: '#/components/messages/emptyMessage'
components:
  messages:
    emptyMessage:
      payload:
        type: object
      name: EmptyMessage
      summary: Empty message


# camera.yml
asyncapi: 2.0.0
id: 'urn:zbos-mqtt-api'
defaultContentType: application/json
info:
  title: Camera
  version: 2.6.3
  description: API for communication with ZBOS by Zora Robotics.
  contact:
    email: info@zorarobotics.be
channels:
  zbos/camera/picture/event:
    subscribe:
      summary: 'event: Get picture'
      description: ''
      tags:
        - name: Camera
          description: All camera related topics.
      message:
        payload:
          type: string
        name: String
  zbos/camera/picture/get:
    publish:
      summary: Get picture
      description: ''
      tags:
        - name: Camera
          description: All camera related topics.
      message:
        $ref: '#/components/messages/keyMessage'
components:
  messages:
    keyMessage:
      payload:
        type: object
        properties:
          key:
            type: string
            description: Required random key
      name: KeyResult
      summary: Random key
      examples:
        - payload:
            key: ABCxyz

# base.yml
asyncapi: 2.0.0
id: 'urn:zbos-mqtt-api'
defaultContentType: 'application/json'
info:
  title: ZBOS MQTT API
  version: 2.6.3
  description: API for communication with ZBOS by Zora Robotics.
  contact:
    email: info@zorarobotics.be
servers:
  local:
    url: '127.0.0.1'
    protocol: mqtt
    description: This is the local robot broker.
    variables:
      port:
        enum:
          - '1883'
          - '9001'
        default: '1883'
  cloud:
    url: zbos-mqtt.zoracloud.com
    protocol: mqtt
    description: This is the cloud broker.
    variables:
      port:
        enum:
          - '1883'
          - '1884'
          - '9001'
          - '9002'

# all.yml
asyncapi: 2.0.0
id: urn:zbos-mqtt-api
defaultContentType: application/json
info:
  title: ZBOS MQTT API
  version: 2.6.3
  description: API for communication with ZBOS by Zora Robotics.
  contact:
    email: info@zorarobotics.be
channels:
  zbos/audio/player/start:
    publish:
      summary: Play media
      description: |
        Play specific media from audio options
      tags:
        - name: Audio
          description: All audio related topics.
      message:
        payload:
          type: object
          properties:
            requestId:
              type: string
            url:
              type: string
            loop:
              type: boolean
        name: AudioOptions
        examples:
          - payload:
              requestId: "1"
              url: Url
              loop: true
  zbos/audio/player/stop:
    publish:
      summary: Stop media
      description: ""
      tags:
        - name: Audio
          description: All audio related topics.
      message:
        $ref: "#/components/messages/emptyMessage"
  zbos/camera/picture/event:
    subscribe:
      summary: "event: Get picture"
      description: ""
      tags:
        - name: Camera
          description: All camera related topics.
      message:
        payload:
          type: string
        name: String
  zbos/camera/picture/get:
    publish:
      summary: Get picture
      description: ""
      tags:
        - name: Camera
          description: All camera related topics.
      message:
        $ref: "#/components/messages/keyMessage"
components:
  messages:
    emptyMessage:
      payload:
        type: object
      name: EmptyMessage
      summary: Empty message
    keyMessage:
      payload:
        type: object
        properties:
          key:
            type: string
            description: Required random key
      name: KeyResult
      summary: Random key
      examples:
        - payload:
            key: ABCxyz
servers:
  local:
    url: 127.0.0.1
    protocol: mqtt
    description: This is the local robot broker.
    variables:
      port:
        enum:
          - "1883"
          - "9001"
        default: "1883"
  cloud:
    url: zbos-mqtt.zoracloud.com
    protocol: mqtt
    description: This is the cloud broker.
    variables:
      port:
        enum:
          - "1883"
          - "1884"
          - "9001"
          - "9002"


```


</details>


<details>
<summary><b>Resolve external references into a single file</b></summary>

**CLI Command**
```
asyncapi-bundle ./asyncapi.yaml -o all.yaml
```

**Files**
```yaml

# asyncapi.yaml
asyncapi: '2.2.0'
info:
  title: Account Service
  version: 1.0.0
  description: This service is in charge of processing user signups
channels:
  user/signedup:
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

# all.yaml
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

