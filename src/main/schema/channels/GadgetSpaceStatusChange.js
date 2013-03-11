define([], function () {
    return {
        "schemaId": "smithy/schema/channels/GadgetSpaceStatusChange",
        "description": "Indicates a gadget space status change.",
        "properties": {
            "status": {
                "type": "string",
                "description": "Current status of the gadget space.",
                "enum": ["CREATED", "RENDERED", "DESTROYED"],
                "required": true
            }
        }
    };
});