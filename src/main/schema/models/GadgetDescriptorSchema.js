define([], function () {

    return {
        "id": "smithy/schema/GadgetDescriptorSchema",
        "tag": {
            "resolved": false
        },
        "description": "The significant properties of a Gadget Descriptor",
        "$schema": "http://json-schema.org/draft-03/schema",
        "type": "object",
        "properties": {
            "activationChannel": {
                "type": "string",
                "description": "The channel name that activates this gadget.",
            },
            "name": {
                "type": "string",
                "description": "The name of the gadget.",
            }
        }
    };
});
