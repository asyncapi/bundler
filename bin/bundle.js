#!/usr/bin/env node
const { Command } = require("commander");
const {bundle} = require('../lib');
const fs = require("fs");
const path = require("path");

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
  if (Array.isArray(files)) {
    let base;
    if(options.base) {
      base = fs.readFileSync(path.resolve(process.cwd(), options.base), 'utf-8');
    }

    const document = await bundle(
      files.map(file => fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8')),
      {
        base: base
      }
    );

    if(options.output) {
      if(path.extname(options.output) === '.yml' || path.extname(options.output) === '.yaml') {
        fs.writeFileSync(path.resolve(process.cwd(), options.output), document.yml(), {encoding: 'utf-8'});
        return console.log('File Successfully created');
      }

      if(path.extname(options.output) === '.json') {
        fs.writeFileSync(path.resolve(process.cwd(), options.output), document.string(), {encoding: 'utf-8'});
        return console.log('File Successfully created');
      }
    }else {
      console.log(document.json());
    }
  }
}

main(args, opts).catch((e) => console.error(e));
