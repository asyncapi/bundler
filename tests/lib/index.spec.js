const bundle = require("../../lib");
const fs = require("fs");
const path = require("path");

describe("bundler should ", () => {
  test("should return bundled doc", async () => {
    const files = ["./tests/camera.yml", "./tests/audio.yml"];
    const response = await bundle(
      files.map((file) =>
        fs.readFileSync(path.resolve(process.cwd(), file), "utf-8")
      ),
      {
        base: fs.readFileSync(path.resolve(process.cwd(), './tests/base.yml'), 'utf-8'),
        validate: false
      }
    );
    expect(response).toBeDefined();
  });

  test("should bundle references into components", async () => {
    const files = ['./tests/asyncapi.yaml']
    const doc = await bundle(
      files.map(file => fs.readFileSync(path.resolve(process.cwd(), file), "utf-8")),
      {
        referenceIntoComponents: true
      }
    )

    const asyncapiObject = doc.json();
    expect(asyncapiObject.channels['user/signedup'].subscribe.message['$ref']).toMatch('#/components/messages/UserSignedUp')
  })

});
