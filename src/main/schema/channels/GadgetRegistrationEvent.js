define([], function () {
    return {
        "schemaId": "smithy/schema/channels/GadgetRegistrationEvent",
        "description": "Indicates an event in the registration of gadgets in a gadget space.",
        "properties": {
            "gadget": {
                "type": "string",
                "description": "The name of the subject gadget.",
                "optional": false
            },
            "event": {
                "type": "string",
                "description": "The registration event that occurred.",
                "enum": ["GADGETADDED", "GADGETREMOVED"],
                "optional": false
            }
        }
    };
});