const bundle = require('@asyncapi/bundler');
const fs = require('fs');

async function main(){
    const document = await bundle([
        fs.readFileSync('./main.yaml', 'utf-8')
    ]);
    fs.writeFileSync('asyncapi.yaml', document.yml());
}

main().catch(e => console.error(e));