const $RefParser = require('@apidevtools/json-schema-ref-parser');

async function parse(JSONSchema) {
    const $ref = await $RefParser.resolve(JSONSchema);
    // Fetch all the $ref's from the asyncapi document. 
    const allRefs = crawlRefs(JSONSchema);


}


function crawlRefs(JSONSchema){
    const $refs = [];
    function process(key, value) {
        if(key === '$ref') {
           $refs.push(value)
        }
    }
    function travers(o, func) {
        for (var i in o) {
            func.apply(this, [i, o[i]]);
            if(o[i] !== null && typeof(o[i]) === 'object') {
                travers(o[i], func)
            }
        }
    }

    travers(JSONSchema, process);

    return $refs
}

module.exports = {
    parse
}
