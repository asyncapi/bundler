const { bundle } = require("../../lib");
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
        base: fs.readFileSync(path.resolve(process.cwd(), './tests/base.yml'), 'utf-8')
      }
    );
    console.log(response.yml());
    expect(response).toBeDefined();
  });
});
