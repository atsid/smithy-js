"use strict";

/**
 * @class SMITHY/Gadget
 * Base class for all gadgets. This class contains life-cycle methods to support gadget development
 * and management.
 */
define([
    "./declare",
    "./Logger",
    "./lifecycle/LifeCycle"
], function (
    declare,
    Logger,
    LifeCycle
) {
    var logger = new Logger("debug"),
        module = declare([LifeCycle], {

        constructor: function (config) {
            this.config = config;
            this.stateData = {};
        },

        /**
         * Get the "view" associated with this gadget.
         * By default it is the gadget itself.
         */
        getView: function () {
            return this;
        },

        /**
         * The destroy method for this gadget called by the framework to shut down ths
         * gadget.
         */
        destroy: function () {
            this.inherited(arguments);
            this.teardownLifecycle();
        }
    });

    return module;

});
