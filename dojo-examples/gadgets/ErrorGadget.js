define([
    "smithy/declare",
    "smithy/Gadget",
    "dijit/layout/ContentPane"
], function (
    declare,
    Gadget,
    ContentPane
) {

/**
 * @class TitleGadget
 * A simple Title bar gadget
 */

    return declare([ContentPane, Gadget], {

        name: "ErrorGadget",

        setupView: function () {
            this.inherited(arguments);
            this.set("content", "<b>Oops! Bad path</b>");
        }
    });
});
