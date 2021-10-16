# Example

I would like to create a simple example of the usecase for the bundler and what it is trying to solve. Inspired by [zbos](https://bitbucket.org/qbmt/zbos-mqtt-api/src/master/), where there are multiple asyncapi files that define one particular component. 

Consider two separate specification file that define two different interfaces. 

<details>
<summary> <bold>audio.json</bold> </summary>

```json
{
  "asyncapi": "2.0.0",
  "id": "urn:zbos-mqtt-api",
  "defaultContentType": "application/json",
  "info": {
    "title": "Audio",
    "version": "2.6.3",
    "description": "API for communication with ZBOS by Zora Robotics.",
    "contact": {
      "email": "info@zorarobotics.be"
    }
  },
  "channels": {
    "zbos/audio/player/start": {
      "publish": {
        "summary": "Play media",
        "description": "Play specific media from audio options\n",
        "tags": [
          {
            "name": "Audio",
            "description": "All audio related topics."
          }
        ],
        "message": {
          "payload": {
            "type": "object",
            "properties": {
              "requestId": {
                "type": "string"
              },
              "url": {
                "type": "string"
              },
              "loop": {
                "type": "boolean"
              }
            }
          },
          "name": "AudioOptions",
          "examples": [
            {
              "payload": {
                "requestId": "1",
                "url": "Url",
                "loop": true
              }
            }
          ]
        }
      }
    },
    "zbos/audio/player/stop": {
      "publish": {
        "summary": "Stop media",
        "description": "",
        "tags": [
          {
            "name": "Audio",
            "description": "All audio related topics."
          }
        ],
        "message": {
          "$ref": "#/components/messages/emptyMessage"
        }
      }
    }
  },
  "components": {
    "messages": {
      "emptyMessage": {
        "payload": {
          "type": "object"
        },
        "name": "EmptyMessage",
        "summary": "Empty message"
      }
    }
  }
}

```

</details>


<details align="right">
<summary>camera.json</summary>

```json
{
  "asyncapi": "2.0.0",
  "id" : "urn:zbos-mqtt-api",
  "defaultContentType" : "application/json",
  "info" : {
    "title" : "Camera",
    "version" : "2.6.3",
    "description" : "API for communication with ZBOS by Zora Robotics.",
    "contact" : {
      "email" : "info@zorarobotics.be"
    }
  },
  "channels": {
    "zbos/camera/picture/event" : {
      "subscribe" : {
        "summary" : "event: Get picture",
        "description" : "",
        "tags" : [ {
          "name" : "Camera",
          "description" : "All camera related topics."
        } ],
        "message" : {
          "payload" : {
            "type" : "string"
          },
          "name" : "String"
        }
      }
    },
        "zbos/camera/picture/get" : {
      "publish" : {
        "summary" : "Get picture",
        "description" : "",
        "tags" : [ {
          "name" : "Camera",
          "description" : "All camera related topics."
        } ],
        "message" : {
          "$ref" : "#/components/messages/keyMessage"
        }
      }
    }
  },
  "components": {
    "messages": {
            "keyMessage" : {
        "payload" : {
          "type" : "object",
          "properties" : {
            "key" : {
              "type" : "string",
              "description" : "Required random key"
            }
          }
        },
        "name" : "KeyResult",
        "summary" : "Random key",
        "examples" : [ {
          "payload" : {
            "key" : "ABCxyz"
          }
        } ]
      }
    }
  }
}

```

</details>