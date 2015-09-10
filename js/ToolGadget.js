"use strict";
/**
 * @class SMITHY/ToolGadget
 * The base class for gadgets that need to interact with the GadgetSpace.
 */
define([
    "./declare",
    "./Gadget"
], function (
    declare,
    Gadget
) {
    var module = declare([Gadget], {

        constructor: function (config) {
            this.gadgetSpace = config.gadgetSpace;
        }

    });

    return module;

});
