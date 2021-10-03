#!/usr/bin/env node

const asyncapiBundler = require("../src"),
  fs = require("fs"),
  path = require("path"),
  yaml = require("js-yaml");

async function run(argv) {
  const inputFilePath = argv[2];
  const outputFilePath = argv[3];
  if (typeof inputFilePath && typeof outputFilePath === "undefined") {
    throw new Error("Missing parameters");
  }
  const specFile = fs.readFileSync(
    path.resolve(process.cwd(), inputFilePath),
    "utf-8"
  );
  const combinedSchema = await asyncapiBundler.bundle(yaml.load(specFile));

  fs.writeFileSync(outputFilePath, yaml.dump(combinedSchema), {
    encoding: "utf-8",
  });

  return "Success";
}

run(process.argv)
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.error("Error >> ",error.message);
  });
