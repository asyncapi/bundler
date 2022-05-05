const $RefParser = require('@apidevtools/json-schema-ref-parser');
const {JSONPath} = require('jsonpath-plus');

async function parse(JSONSchema) {
    const $ref = await $RefParser.resolve(JSONSchema);
   const $refList = JSONPath({json: JSONSchema.channels, path: `$.channels.*.*.message.$ref`, resultType: 'all'});
   $refList.forEach(ref => {
       const obj = {};
       obj[String('UserSignedUp')] = $ref.get(ref.value);
       console.log(obj);
   });

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
