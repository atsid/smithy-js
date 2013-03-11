define([], function () {
    return {
        "schemaId": "smithy/schema/channels/GadgetStatusChange",
        "description": "Indicates a gadget status change.",
        "properties": {
            "name": {
                "type": "string",
                "description": "Name of gadget",
                "required": true
            },
            "address": {
                "type": "string",
                "description": "The address of the gadget's area.",
                "required": true
            },
            "status": {
                "type": "string",
                "description": "Current status of the gadget.",
                "enum": ["CREATED", "MESSAGING-UP", "SERVICES-UP", "VIEW-UP", "SERVICES-DN", "VIEW-DN", "DESTROYING"],
                "required": true
            }
        }
    };
});