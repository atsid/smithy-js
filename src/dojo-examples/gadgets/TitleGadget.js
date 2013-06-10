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

        constructor: function (config) {
            this.ApplicationTitle = (config && config.initData && config.initData.applicationTitle) ||
                "A Smithy-js Test Application";
            this.style = "width: 30%";
        },

        name: "TitleGadget",
        title: "Title Gadget",

        setupView: function () {
            this.inherited(arguments);
            this.set("content", "<b>" + this.ApplicationTitle + "</b>");
        }
    });
});
