define([], function () {
    return {
        "schemaId": "smithy/schema/channels/GadgetStatusChange",
        "description": "Indicates a gadget status change.",
        "properties": {
            "name": {
                "type": "string",
                "description": "Name of gadget",
                "optional": false
            },
            "address": {
                "type": "string",
                "description": "The address of the gadget's area.",
                "optional": false
            },
            "status": {
                "type": "string",
                "description": "Current status of the gadget.",
                "enum": ["CREATED", "MESSAGING-UP", "SERVICES-UP", "VIEW-UP", "SERVICES-DN", "VIEW-DN", "DESTROYING"],
                "optional": false
            }
        }
    };
});