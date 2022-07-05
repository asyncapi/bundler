const $RefParser = require('@apidevtools/json-schema-ref-parser');
const { JSONPath } = require('jsonpath-plus');
const { takeWhile, merge } = require('lodash');

class ExternalComponents {
    ref;
    resolvedJSON;
    constructor(ref, resolvedJSON) {
        this.ref = ref;
        this.resolvedJSON = resolvedJSON;
    }

    getKey(){
        const keys = this.ref.split('/');
        return keys[keys.length -1 ]
    }

    getValue() {
        return this.resolvedJSON;
    }
}

async function parse(JSONSchema) {
    const $ref = await $RefParser.resolve(JSONSchema);
    const refs = crawlChanelPropertiesForRefs(JSONSchema);
    for (let ref of refs) {
        if (isExternalReference(ref)) {
            const componentObject = await resolveExternalRefs(JSONSchema, $ref);
            merge(JSONSchema.components, componentObject);
            console.log(JSONSchema.components)
        }
    }





}


function crawlChanelPropertiesForRefs(JSONSchema) {
    return JSONPath({ json: JSONSchema, path: `$.channels.*.*.message['$ref']` });
}


/**
 * 
 * @param {string} ref 
 * @returns {boolean}
 */
function isExternalReference(ref) {
    return !ref.startsWith('#')
}



module.exports = {
    parse,
    resolve
}

/**
 * 
 * @param {object[]} parsedJSONs 
 */
async function resolve(parsedJSONs) {
    const $refParser = new $RefParser();
    const resolvedJSONs = [];
    for (let parsedJSON of parsedJSONs) {
        const $ref = await $refParser.resolve(parsedJSON);
        const externalChannelRefs = getExternalChannelRefs(parsedJSON);

    }

}

async function resolveExternalRefs(parsedJSON, $refs) {
    const componentObj = {messages: {}};
    JSONPath({ json: parsedJSON, resultType: 'all', path: '$.channels.*.*.message' }).forEach(({ parent, parentProperty }) => {
        const ref = parent[parentProperty]['$ref'];
        if (isExternalReference(ref)) {
            const value = $refs.get(ref);
            const component = new ExternalComponents(ref, value);
            componentObj.messages[String(component.getKey())] = component.getValue()
            parent[parentProperty]['$ref'] = `#/components/messages/${component.getKey()}`;
        }

    })

    return componentObj
}

/**
 * 
 * @param {object} parsedJSON 
 */
function getExternalChannelRefs(parsedJSON) {
    return JSONPath({ path: '', json: parsedJSON })
}