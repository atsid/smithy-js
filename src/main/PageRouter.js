/**
 * @class smithy/PageRouter
 * Smithy framework element that allows function routing based on initial or updated url contents.
 * It depends on smith/HashRouter which is a mock version to be replaced by another implementation.
 * It can be configured as follows:
 * {
 *     mode: "hash" || "url" || undefined
 *     urlPattern: a regular expression to match against the url or hash.
 * }
 * The class implements the following api:
 *   register(pattern, callback) - pattern is a regular expression to match against the
 */
define([
    "./declare",
    "./util",
    "./HashRouter"
], function (
    declare,
    Util,
    hashRouter
    ) {
    var callbacks = {}, util = new Util(), module = declare(null, {

        constructor: function (config) {
            var that = this, urlPattern = config && config.urlPattern;
            if (config.mode === "hash") {
                this.router = hashRouter;
                this.register = function() {
                    hashRouter.register.apply(hashRouter, arguments);
                };
                this.startup = function() {
                    hashRouter.startup.apply(hashRouter, arguments);
                };
                this.go = function() {
                    hashRouter.go.apply(hashRouter, arguments);
                };
                this.isDefault = function () {
                    return !window.location.hash;
                }
            } else if (config.mode === "url") {
                this.register = function (pattern, callback) {
                    callbacks[pattern.toString()] = {
                        fn: callback,
                        rgx: pattern
                    };
                };
                this.startup = function () {
                    window.onload = function () {
                        Object.keys(callbacks).forEach(function (key, idx, obj) {
                            var d = callbacks[key],
                                matches = d.rgx.exec(window.location.pathname);
                            if (matches && matches !== null) {
                                d.fn({newPath: matches[0]});
                            }
                        });
                    }
                };
                this.go = function (location) {
                    var newPath = window.location.pathname;
                    if (urlPattern.test(window.location.pathname)) {
                        newPath = newPath.replace(config.urlPattern, location);
                        window.location.pathname = newPath;
                    } else {
                        window.location.pathname = window.location.pathname + "/" + location;
                    }
                };
                this.isDefault = function () {
                    return !config.urlPattern.test(window.location.pathname);
                }
            }
        }
    });

    return module;

});
