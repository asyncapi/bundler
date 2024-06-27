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

    await expect(
      async () => {
        await bundle(files, {
          xOrigin: true,
          base: 'base.yml',
          baseDir: path.resolve(process.cwd(), './tests'),
          noValidation: true,
        })
      }
    ).rejects.toThrow(JSONParserError);
  });

  test('should be able to bundle base file', async () => {
    const files = [
      './tests/base-option/lights.yaml',
      './tests/base-option/camera.yaml',
    ];

    expect(
      await bundle(files, {
        xOrigin: true,
        base: path.resolve(process.cwd(), './tests/base-option/base.yaml'),
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
