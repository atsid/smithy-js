define([
    "ORE/lang",
    "ORE/assert",
    "ORE/NoAbstractMethodImplError",
    "ORE/InvalidArgumentError",
    "SMITHY/Gadget",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/form/Textarea"
], function (
    OreLang,
    Assert,
    NoAbstractMethodImplError,
    InvalidArgumentError,
    Gadget,
    DojoLang,
    ContentPane,
    Textarea
) {

/**
 * @class SimpleGadget
 * A simple gadget for test purposes.
 */

    return OreLang.declare([ContentPane, Gadget], {

        name: "TextAreaGadget",

        setupMessaging: function () {
            this.registerSubscriber("DisplayText", function (message) {
                this.textArea.set("value", message.text);
            });
            this.registerPublisher("DisplayText");
        },

        setupView: function () {
            this.textArea = new Textarea({
            });

            this.title = "Test Text Widget";

            this.inherited(arguments);

            this.textArea.placeAt(this.domNode);

            this.textArea.onChange = DojoLang.hitch(this, function (event) {
                this.pub.DisplayText({text: this.textArea.get("value")});
            });

        }
    });
});
