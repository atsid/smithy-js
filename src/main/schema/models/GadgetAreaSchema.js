define([], function () {

    return {
        "id": "smithy/schema/GadgetAreaSchema",
        "tag": {
            "resolved": false
        },
        "description": "The significant properties on a GadgetArea",
        "$schema": "http://json-schema.org/draft-03/schema",
        "type": "object",
        "properties": {
            "address": {
                "type": "string",
                "description": "the address in the gadget space for this area",
                "required": true
            },
            "layoutMode": {
                "type": "string",
                "description": "the type of layout for this area, understood by the layoutFunction for the area",
                "required": true
            },
            "gadget": {
                "type": "object",
                "description": "The model schema describing the gadget.",
                "$ref" : "smithy/schema/models/GadgetSchema"
            },
            "subAreas": {
                "type": "array",
                "description": "List of areas under this node.",
                "required": false,
                "items": {
                    "$ref": "smithy/schema/models/GadgetAreaSchema"
                }
            }
        }
    };
});
