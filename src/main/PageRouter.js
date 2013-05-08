/**
 * @class smithy/PageRouter
 * Smithy framework element that allows function routing based on initial or updated url contents.
 * It depends on smithy/HashRouter which is a mock version to be replaced by another implementation.
 * It can be configured as follows:
 * {
 *     mode: "hash" || "url" || undefined
 *     rootUrlPattern: a regular expression to match against the root url.
 *     noMatch: a method to call if no matches were found on startup.
 * }
 * noMatch is passed an argument of the form:
 *  {
 *     pathname: "the path after factoring out rootUrlPattern",
 *     search: "the query portion of the url with the '?'"
 *  }
 * The class implements the following api (modelled after dojo's router api:
 *   register(pattern, callback) - pattern is a regular expression to match against the
 *   startup() - start listening for url changes and matching route patterns.
 *   go(location, params) - route to the given location with the give parameters.
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
                noMatchFn = config && config.noMatch,
                currentLoc = window.location;
            /**
             * Setup hash router.
             */
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

            // Implement simple url router.
            } else if (config.mode === "url") {
                /**
                 * Register a pattern to match with its accompanying callback.
                 * @param pattern - the url pattern pattern to match, minus the root url pattern specified in rootPattern.
                 * @param callback - the callback to invoke when pattern matches, expected to keep its own scope and has
                 * the following signature: callback({
                 *     pathname: "the matched path",
                  *    search: "the current query params from the url with the preceding ?"
                  *  })
                 */
                this.register = function (pattern, callback) {
                    callbacks[pattern.toString()] = {
                        fn: callback,
                        rgx: pattern
                    };
                };

                /**
                 * Initiate path checking, results in a scan of patterns at window.onload time.
                 */
                this.startup = function () {
                    window.onload = function () {
                        var relevantPath = currentLoc.pathname.replace(urlPattern, ""),
                            matched;
                        Object.keys(callbacks).some(function (key, idx, obj) {
                            var d = callbacks[key],
                                matches = d.rgx.exec(relevantPath);
                            if (matches && matches !== null) {
                                matched = true;
                                d.fn({
                                    pathname: matches[0],
                                    search: currentLoc.search
                                });
                            }
                            return matched;
                        });
                        if (!matched && noMatchFn) {
                            noMatchFn({
                                pathname: relevantPath,
                                search: currentLoc.search
                            });
                        }
                    }
                };

                /**
                 * Update window location using "assign()' based on the params passed.
                 * @param location - the path minus the root to route to.
                 * @param params - the query parameters to convert and pass in the query portion of the URL,
                 * an object of the form:
                 * {
                 *    paramName: paramValue
                 * }
                 * converted to "?paramName=paramValue".
                 */
                this.go = function (location, params) {
                    var newPath = currentLoc.pathname;
                    if (!this.isDefault()) {
                        newPath = newPath.match(urlPattern)[0];
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

                /**
                 * Test whether the current url is the root path only.
                 * @returns {boolean} true if the current path is just the root path.
                 */
                this.isDefault = function () {
                    return !currentLoc.pathname.replace(urlPattern, "");
                }
            }
        }
    });

    return module;

});
