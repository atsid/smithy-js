define({
    "id": "smithy/schema/GadgetDescriptorSchema",
    "description": "The significant properties on a gadget registry entry",
    "$schema": "http://json-schema.org/draft-03/schema",
    "type": "object",
    "properties": {
        "name": {
            type: "string",
            description: "the name the gadget is registered under.",
            required: true
        },
        "gadget": {
            type: "string",
            description: "the name of the gadget class to load.",
            required: true
        },
        "data": {
            type: "any",
            description: "Static data to pass to the gadget when loading."
        }
    }
});
