import { describe, expect, test } from '@jest/globals';
import bundle from '../../src';
import { isExternalReference } from '../../src/util';
import path from 'path';
import { JSONParserError } from '@apidevtools/json-schema-ref-parser';

describe('[integration testing] bundler should ', () => {
  // as the working directory might get changed, make sure to reset it
  let workingDirectory: string = process.cwd();
  afterEach(() => {
    process.chdir(workingDirectory);
  });

  test('should return bundled doc', async () => {
    const files = ['./tests/camera.yml', './tests/audio.yml'];
    const response = await bundle(files, {
      base: path.resolve(process.cwd(), './tests/base.yml'),
      noValidation: true,
    });
    expect(response).toBeDefined();
  });

  test('should not throw if value of `$ref` is not a string', async () => {
    const files = ['./tests/wrong-ref-not-string.yaml'];

    // If async function `bundle()` resolved Promise successfully, that means it
    // did not throw exception during process of execution, which is the
    // objective of testing.
    expect(
      await bundle(files, {
        xOrigin: true,
        noValidation: true,
      })
    ).resolves;
  });

  test('should not throw if value of `$ref` is absent', async () => {
    const files = ['./tests/wrong-ref-absent.yaml'];

    // If async function `bundle()` resolved Promise successfully, that means it
    // did not throw exception during process of execution, which is the
    // objective of testing.
    expect(
      await bundle(files, {
        xOrigin: true,
        noValidation: true,
      })
    ).resolves;
  });

  test('should throw if external `$ref` cannot be resolved', async () => {
    const files = ['wrong-external-ref.yaml'];

    await expect(async () => {
      await bundle(files, {
        xOrigin: true,
        base: 'base.yml',
        baseDir: path.resolve(process.cwd(), './tests'),
        noValidation: true,
      });
    }).rejects.toThrow(JSONParserError);
  });

  test('should be able to bundle base file', async () => {
    const files = [
      './tests/base-option/lights.yaml',
      './tests/base-option/camera.yaml',
    ];

    expect(
      await bundle(files, {
        base: path.resolve(process.cwd(), './tests/base-option/base.yaml'),
        xOrigin: true,
        noValidation: true,
      })
    ).resolves;
  });

  test('should be able to change the baseDir folder', async () => {
    const files = ['main.yaml'];
    expect(
      await bundle(files, { baseDir: './tests/specfiles', noValidation: true })
    ).resolves;
  });

  test('should be able to bundle specification files in subdirectories and merge them into the base file', async () => {
    const object = {
      asyncapi: '3.0.0',
      info: {
        title: 'Streetlights MQTT API',
        version: '1.0.0',
        description:
          'The Smartylighting Streetlights API allows you to remotely manage the city lights.\n\n### Check out its awesome features:\n\n* Turn a specific streetlight on/off 🌃\n* Dim a specific streetlight 😎\n* Receive real-time information about environmental lighting conditions 📈\n',
        license: {
          name: 'Apache 2.0',
          url: 'https://www.apache.org/licenses/LICENSE-2.0',
        },
      },
      defaultContentType: 'application/json',
      servers: {
        production: {
          host: 'test.mosquitto.org:{port}',
          protocol: 'mqtt',
          description: 'Test broker',
          variables: {
            port: {
              description:
                'Secure connection (TLS) is available through port 8883.',
              default: '1883',
              enum: ['1883', '8883'],
            },
          },
        },
      },
      channels: {
        lightTurnOn: {
          address:
            'smartylighting/streetlights/1/0/action/{streetlightId}/turn/on',
          messages: {
            turnOn: {
              name: 'turnOnOff',
              title: 'Turn on/off',
              summary:
                'Command a particular streetlight to turn the lights on or off.',
              payload: {
                $schema: 'https://json-schema.org/draft/2020-12/schema',
                type: 'object',
                properties: {
                  command: {
                    type: 'string',
                    enum: ['on', 'off'],
                    description: 'Whether to turn on or off the light.',
                  },
                  sentAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Date and time when the message was sent.',
                  },
                },
              },
            },
          },
        },
        lightTurnOff: {
          address:
            'smartylighting/streetlights/1/0/action/{streetlightId}/turn/off',
          messages: {
            turnOff: {
              name: 'turnOnOff',
              title: 'Turn on/off',
              summary:
                'Command a particular streetlight to turn the lights on or off.',
              payload: {
                $schema: 'https://json-schema.org/draft/2020-12/schema',
                type: 'object',
                properties: {
                  command: {
                    type: 'string',
                    enum: ['on', 'off'],
                    description: 'Whether to turn on or off the light.',
                  },
                  sentAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Date and time when the message was sent.',
                  },
                },
              },
            },
          },
        },
        lightingMeasured: {
          address:
            'smartylighting/streetlights/1/0/event/{streetlightId}/lighting/measured',
          messages: {
            lightMeasured: {
              name: 'lightMeasured',
              title: 'Light measured',
              summary:
                'Inform about environmental lighting conditions of a particular streetlight.',
              contentType: 'application/json',
              payload: {
                $schema: 'https://json-schema.org/draft/2020-12/schema',
                type: 'object',
                properties: {
                  lumens: {
                    type: 'integer',
                    minimum: 0,
                    description: 'Light intensity measured in lumens.',
                  },
                  sentAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Date and time when the message was sent.',
                  },
                },
              },
            },
          },
          description:
            'The topic on which measured values may be produced and consumed.',
          parameters: {
            streetlightId: {
              description: 'The ID of the streetlight.',
            },
          },
        },
      },
      operations: {
        turnOn: {
          action: 'send',
          channel: {
            $ref: '#/channels/lightTurnOn',
          },
          messages: [
            {
              $ref: '#/channels/lightTurnOn/messages/turnOn',
            },
          ],
        },
        turnOff: {
          action: 'send',
          channel: {
            $ref: '#/channels/lightTurnOff',
          },
          messages: [
            {
              $ref: '#/channels/lightTurnOff/messages/turnOff',
            },
          ],
        },
        receiveLightMeasurement: {
          action: 'receive',
          channel: {
            $ref: '#/channels/lightingMeasured',
          },
          summary:
            'Inform about environmental lighting conditions of a particular streetlight.',
          messages: [
            {
              $ref: '#/channels/lightingMeasured/messages/lightMeasured',
            },
          ],
        },
      },
      components: {
        messages: {
          turnOnOff: {
            name: 'turnOnOff',
            title: 'Turn on/off',
            summary:
              'Command a particular streetlight to turn the lights on or off.',
            payload: {
              $schema: 'https://json-schema.org/draft/2020-12/schema',
              type: 'object',
              properties: {
                command: {
                  type: 'string',
                  enum: ['on', 'off'],
                  description: 'Whether to turn on or off the light.',
                },
                sentAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Date and time when the message was sent.',
                },
              },
            },
          },
          lightMeasured: {
            name: 'lightMeasured',
            title: 'Light measured',
            summary:
              'Inform about environmental lighting conditions of a particular streetlight.',
            contentType: 'application/json',
            payload: {
              $schema: 'https://json-schema.org/draft/2020-12/schema',
              type: 'object',
              properties: {
                lumens: {
                  type: 'integer',
                  minimum: 0,
                  description: 'Light intensity measured in lumens.',
                },
                sentAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Date and time when the message was sent.',
                },
              },
            },
          },
        },
      },
    };

    const files = [
      'asyncapi/send/lightTurnOn/asyncapi.yaml',
      'asyncapi/send/lightTurnOff/asyncapi.yaml',
      'asyncapi/receive/lightingMeasured/asyncapi.yaml',
    ];

    const document = await bundle(files, {
      base: 'asyncapi/index.yaml',
      baseDir: path.resolve(process.cwd(), 'tests/nested-dirs-mixed'),
      noValidation: true,
    });

    expect(document.json()).toMatchObject(object);
  });
});

describe('[unit testing]', () => {
  test('`isExternalReference()` should return `true` on external reference', () => {
    expect(
      isExternalReference('./components/messages/UserSignedUp')
    ).toBeTruthy();
  });
  test('`isExternalReference()` should return `false` on local reference', () => {
    expect(
      isExternalReference('#/components/messages/UserSignedUp')
    ).toBeFalsy();
  });
});
