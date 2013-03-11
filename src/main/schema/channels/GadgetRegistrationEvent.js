define([], function () {
    return {
        "schemaId": "smithy/schema/channels/GadgetRegistrationEvent",
        "description": "Indicates an event in the registration of gadgets in a gadget space.",
        "properties": {
            "gadget": {
                "type": "string",
                "description": "The name of the subject gadget.",
                "require": true
            },
            "descriptor" : {
                "type": "object",
                "description": "The descriptor provided during gadget registration.",
                "required": false
            },
            "event": {
                "type": "string",
                "description": "The registration event that occurred.",
                "enum": ["GADGETADDED", "GADGETREMOVED"],
                "required": true
            }
        }
    };
});