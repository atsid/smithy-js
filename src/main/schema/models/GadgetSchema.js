define([], function () {

    return {
        "id": "smithy/schema/models/GadgetSchema",
        "tag": {
            "resolved": false
        },
        "description": "The significant properties of a Gadget",
        "$schema": "http://json-schema.org/draft-03/schema",
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "A class name resolvable by a GadgetFactory.",
                "required": true
            }
        }
    };
});
