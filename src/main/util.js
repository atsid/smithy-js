/**
 * Simple Utilities
 */
define([
    "./declare",
    "./Logger"
], function (
    declare,
    Logger
) {

    var logger = new Logger("debug"),
        module = declare(null, {

            /**
             * Simple dojo.mixin replacement.
             */
            mixin: function (target, source) {
                for (var name in source) {
                    target[name] = source[name];
                }
                return target;
            },

            /**
             * Simple dojo.isArray replacement.
             */
            isArray: function (target) {
                return Object.prototype.toString.call(target) === "[object Array]";
            },

            /**
             * Simple isUndefined.
             */
            isUndefined: function (target) {
                return typeof (target) === "undefined";
            }

        });
    return module;
});