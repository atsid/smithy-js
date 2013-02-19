define([], function () {
    return {
        "id": "APP/schema/TextAreaConfigModelService",
        "tag": {
            "resolved": false
        },
        "SMDVersion": "2.0",
        "$schema": "http://json-schema.org/draft-03/schema",
        "transport": "REST",
        "envelope": "PATH",
        "target": "model",
        "description": "Test config service.",
        "contentType": "application/json",
        "services": {
            "createModel": {
                "transport": "POST",
                "description": "Creates a new Model.",
                "parameters": [
                    {
                        "name": "model",
                        "type": {
                            "$ref": ""
                        },
                        "envelope": "JSON",
                        "description": "model payload",
                        "required": true
                    }
                ],
                "returns": {
                    "$ref": "APP/schema/TextAreaConfigModel"
                }
            },
            "readModel": {
                "target": "{id}",
                "transport": "GET",
                "description": "Get the details for a specific model.",
                "parameters": [
                    {
                        "name": "id",
                        "type": "string",
                        "envelope": "PATH",
                        "description": "ID of model.",
                        "required": true
                    }
                ],
                "returns": {
                    "$ref": "APP/schema/TextAreaConfigModel"
                }
            },
            "updateModel": {
                "target": "{id}",
                "transport": "PUT",
                "description": "Updates details of a Model.",
                "parameters": [
                    {
                        "name": "id",
                        "type": "string",
                        "envelope": "PATH",
                        "description": "ID of model.",
                        "required": true
                    },
                    {
                        "name": "model",
                        "type": {
                            "$ref": "APP/schema/TextAreaConfigModel"
                        },
                        "envelope": "JSON",
                        "description": "model payload",
                        "required": true
                    }
                ],
                "returns": {
                    "$ref": "APP/schema/TextAreaConfigModel"
                }
            },
            "deleteModel": {
                "target": "{id}",
                "transport": "DELETE",
                "description": "Updates details of a Model.",
                "parameters": [
                    {
                        "name": "id",
                        "type": "string",
                        "envelope": "PATH",
                        "description": "ID of model.",
                        "required": true
                    }
                ],
                "returns": "void"
            }
        }
    };
});
