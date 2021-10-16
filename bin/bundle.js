#!/usr/bin/env node
const { Command } = require("commander");
const bundler = require("../src");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const program = new Command();

program
  .name("asyncapi-bundler")
  .addHelpCommand(false)
  .option("-o, --output <path>", "Specify the output path")
  .option("-f, --folder", "All inputs are taken as folder paths")
  .option('-b, --base <path>', "File path of the base asyncapi file whose data will be retained")
  .argument("<filepaths>", "paths of the file to bundle");

program.parse(process.argv);

const args = program.args;
const opts = program.opts();

async function main(files, options) {
  if (Array.isArray(files) && typeof files[0] === "string") {
    let base;
    if(options.base) {
      base = fs.readFileSync(path.resolve(process.cwd(), options.base), 'utf-8');
    }
    const doc = await bundler.bundle(
      files.map((file) =>
        fs.readFileSync(path.resolve(process.cwd(), file), "utf-8")
      ), {base: base}
    );
    if (options.output) {
      const ext = path.extname(options.output);
      if (ext === ".yml" || ext === ".yaml") {
        fs.writeFileSync(
          path.resolve(process.cwd(), options.output),
          yaml.dump(doc),
          { encoding: "utf-8" }
        );
      }
      if (ext === ".json") {
        fs.writeFileSync(
          path.resolve(process.cwd(), options.output),
          JSON.stringify(doc)
        );
      }
      console.log("File created!");
    } else {
      console.log(doc);
    }
  }
}

main(args, opts).catch((e) => console.error(e));
