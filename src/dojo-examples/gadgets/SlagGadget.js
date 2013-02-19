define([
    "smithy/declare",
    "smithy/Gadget",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "dijit/form/Textarea",
    "dijit/form/TextBox"
], function (
    declare,
    Gadget,
    DojoLang,
    ContentPane,
    Button,
    Textarea,
    TextBox
) {

/**
 * @class SimpleGadget
 * A simple gadget for test purposes.
 */

    return declare([ContentPane, Gadget], {

        constructor: function (config) {
            this.style = "width: 30%";
        },

        name: "SlagGadget",

        title: "SlagGadget",

        setupMessaging: function () {
            this.registerFrameworkSubscriber("SlagChange", function (message) {
                this.messageArea.set(
                    "value",
                    "Path: '" +
                        message.path +
                        "' with old value: '" +
                        JSON.stringify(message.oldValue) +
                        "' and new value '" +
                        JSON.stringify(message.newValue) +
                        "'"
                );
            });
        },

        setupView: function () {
            this.textBox = new TextBox({
                label: "value"
            });
            this.pathBox = new TextBox({
                label: "path"
            });
            this.messageArea = new Textarea({
                readOnly: true
            });
            this.setButton = new Button({label: "Set Slag"});

            this.inherited(arguments);

            this.pathBox.placeAt(this.domNode);
            this.textBox.placeAt(this.domNode);
            this.setButton.placeAt(this.domNode);
            this.messageArea.placeAt(this.domNode);

            this.setButton.onClick = DojoLang.hitch(this, function (event) {
                this.gadgetSpace.setSlagData(this.pathBox.get("value"), this.textBox.get("value"));
            });

        }
    });
});
