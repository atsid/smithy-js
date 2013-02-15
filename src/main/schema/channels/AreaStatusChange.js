define([], function () {
    return {
        "schemaId": "smithy/schema/channels/AreaStatusChange",
        "description": "Indicates a gadget status change.",
        "properties": {
            "address": {
                "type": "string",
                "description": "address of area.",
                "optional": false
            },
            "status": {
                "type": "string",
                "description": "Current status of the area.",
                "enum": ["CREATED", "RENDERED", "DESTROYED"],
                "optional": false
            }
        }
    };
});