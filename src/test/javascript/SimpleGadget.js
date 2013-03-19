define([
    "smithy/declare",
    "smithy/Gadget"
], function (
    declare,
    Gadget,
    ContentPane
) {

/**
 * @class SimpleGadget
 * A test gadget
 */

    return declare([Gadget], {

        constructor: function (config) {
        },

        name: "SimpleGadget",

        setupView: function () {
            this.inherited(arguments);
        }
    });
});
