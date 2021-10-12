#!/usr/bin/env node
const bundler = require('../src');
const path = require('path');
const fs = require('fs');

const main = async (files) => {
  const doc = await bundler.bundle(files.map(file => fs.readFileSync(
    path.resolve(process.cwd(), file),
    'utf-8'
  )))
  console.log(doc);
} 

main(process.argv.splice(2)).catch(e => {
  console.error(e);
})