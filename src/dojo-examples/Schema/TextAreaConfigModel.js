define([], function () {
    return {
        "schemaId": "APP/schema/TextAreaConfigModel",
        "description": "Configuration Data Model for the TextAreaGadget",
        "properties": {
            "id": {
                type: "string"
            },
            "text": {
                "type": "string",
                "description": "The Text."
            }
        }
    };
});