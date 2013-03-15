/**
 * @class smithy/PageRouter
 * Smithy framework element that allows function routing based on initial or updated url contents.
 * It depends on smith/HashRouter which is a mock version to be replaced by another implementation.
 * It can be configured as follows:
 * {
 *     mode: "hash" || "url" || undefined
 *     rootUrlPattern: a regular expression to match against the root url.
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
            var that = this,
                urlPattern = config && config.rootPattern,
                currentLoc = window.location;
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
                        var relevantPath = currentLoc.pathname.replace(urlPattern, "");
                        Object.keys(callbacks).forEach(function (key, idx, obj) {
                            var d = callbacks[key],
                                matches = d.rgx.exec(relevantPath);
                            if (matches && matches !== null) {
                                d.fn({
                                    pathname: matches[0],
                                    search: currentLoc.search
                                });
                            }
                        });
                    }
                };
                this.go = function (location, params) {
                    var newPath = currentLoc.pathname;
                    if (!this.isDefault()) {
                        newPath = newPath.match(urlPattern, newPath)[0];
                        newPath = newPath + location;
                    } else {
                        newPath = currentLoc.pathname + "/" + location;
                    }
                    if (params && Object.keys(params).length) {
                        var searchStr;
                        Object.keys(params).forEach(function (key, idx, obj) {
                            searchStr = searchStr || "?";
                            searchStr = searchStr + key + "=" + encodeURIComponent(params[key]);
                        });
                        newPath = newPath + searchStr;
                    }
                    currentLoc.assign(newPath);
                };
                this.isDefault = function () {
                    return !currentLoc.pathname.replace(urlPattern, "");
                }
            }
        }
    });

    return module;

});
