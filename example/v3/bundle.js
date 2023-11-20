const bundle = require('@asyncapi/bundler')
const {readFileSync, writeFileSync} = require('fs')

async function main() {
    const document = await bundle([readFileSync('./main.yaml', 'utf-8')] )
    writeFileSync('asyncapi.yaml', document.yml())
}

main().catch(e => console.error(e))