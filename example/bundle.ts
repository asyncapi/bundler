import * as bundle from '@asyncapi/bundler';
import * as fs from 'fs';

async function main() {
  const document = bundle([fs.readFileSync('./main.yaml', 'utf-8')], {
    referenceIntoComponents: true,
  });
  fs.writeFileSync('asyncapi.yaml', document.yml());
}

main().catch(e => console.error(e));
