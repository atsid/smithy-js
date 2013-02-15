define([
    "ORE/lang",
    "ORE/assert",
    "ORE/NoAbstractMethodImplError",
    "ORE/InvalidArgumentError",
    "SMITHY/Gadget",
    "dijit/layout/ContentPane"
], function (
    OreLang,
    Assert,
    NoAbstractMethodImplError,
    InvalidArgumentError,
    Gadget,
    ContentPane
) {

/**
 * @class TitleGadget
 * A simple Title bar gadget
 */

    return OreLang.declare([ContentPane, Gadget], {

        constructor: function (config) {
            this.ApplicationTitle = (config && config.initData && config.initData.applicationTitle) ||
                "A Smithy-js Test Application";
        },

        name: "TitleGadget",

        setupView: function () {
            this.inherited(arguments);
            this.set("content", "<b>" + this.ApplicationTitle + "</b>");
        }
    });
});
