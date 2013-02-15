define([], function () {
    return {
        "schemaId": "smithy/schema/channels/SlagChange",
        "description": "Indicates a value in the slag has changed.",
        "properties": {
            "path": {
                "type": "string",
                "description": "the path or name of the slag data",
                "optional": false
            },

            "oldValue": {
                "type": "object",
                "description": "The old value of the slag data."
            },

            "newValue": {
                "type": "object",
                "description": "The new value of the slag data."
            }
        }
    };
});