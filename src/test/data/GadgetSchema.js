define([], function () {

    return {
        "id": "schema/GadgetSchema",
        "tag": {
            "resolved": false
        },
        "description": "The significant properties of a Gadget",
        "$schema": "http://json-schema.org/draft-03/schema",
        "type": "object",
        "properties": {
            "class": {
                "type": "string",
                "description": "A class name resolvable by a GadgetFactory.",
                "required": true
            },
            "configModel": {
                "type": "object",
                "description": "The model schema describing the gadget configuration.",
                "$ref" : "DefaultConfigModel"
            }
        }
    };
});
