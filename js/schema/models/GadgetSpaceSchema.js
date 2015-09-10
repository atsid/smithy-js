define({
    "id": "smithy/schema/GadgetSpaceSchema",
    "description": "The significant properties on a GadgetSpace",
    "$schema": "http://json-schema.org/draft-03/schema",
    "type": "object",
    "properties": {
        "gadgetRegistry": {
            type: "array",
            items: {
                "$ref": "smithy/schema/models/GadgetDescriptorSchema"
            }
        },
        "layoutData": {
            "$ref": "smithy/schema/models/GadgetAreaSchema"
        }
    }
});
