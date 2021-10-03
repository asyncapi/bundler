#!/usr/bin/env node

const asyncapiBundler = require("../src"),
  fs = require("fs"),
  path = require("path"),
  yaml = require("js-yaml");

async function run(argv) {
  const inputFilePath = argv[2];
  const outputFilePath = argv[3];
  console.log(inputFilePath, outputFilePath);
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
  .then((val) => {
    console.log(val);
  })
  .catch((error) => {
    console.log(error.message);
  });
