"use strict";
/**
 * @class SMITHY/GadgetFactory
 * Contains methods for resolving and creating gadgets.
 * @cfg {
 *     resolver: function(gadgetName) returning Gadget Class.
 *     resolverAsync: function(gadgetName, callback, scope)
 * }
 */
define([
    "./declare"
], function (
    declare
) {
    var module = declare(null, {
        constructor: function (config) {
            this.resolver = config && config.resolver;
            this.resolverAsync = config && config.resolverAsync;
        },

        /**
         * Retrieve a new resolved gadget accepting the
         * passed config.
         * @param gadgetName
         * @param config
         * @return the new gadget.
         */
        getGadget: function (gadgetName, config) {
            if (!this.resolver) {
                throw new Error("No synchronous resolver was configured for this factory.");
            }
            var GadgetClass = this.resolver(gadgetName);
            return new GadgetClass(config);
        },

        /**
         * Retrieve a new resolved gadget accepting the
         * passed config asynchronously, calling the callback with
         * an instance of the gadget.
         * @param gadgetName
         * @param config
         * @param callback - the method to call with the loaded instance.
         * @param scope - the scope to call the method in.
         * @return undefined
         */
        getGadgetAsync: function (gadgetName, config, callback, scope) {
            if (!this.resolverAsync) {
                throw new Error("No async resolver was configured for this factory.");
            }
            this.resolverAsync(gadgetName, function (GadgetClass) {
                var gadget = new GadgetClass(config);
                callback.call(scope, gadget);
            }, this);
        }

    });

    return module;

});
