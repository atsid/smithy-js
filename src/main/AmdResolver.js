/**
 * @class AmdResolver
 * A simple class to provide a resolver using amd require
 * and a configured path.
 */
define([
    "./declare"
], function (
    declare
) {

    var module = declare(null, {
        constructor: function (config) {
            var path = config && config.path,
                loud = config && config.loud,
                altSeparator = config && config.altSeparator,
                synchronous = config && config.synchronous;

            this.resolver = function (name, callback) {
                var ret, realPath = name;
                if (name.indexOf((altSeparator || "/")) < 0) {
                    realPath = path + name;
                } else if (name.indexOf(path) < 0) {
                    return ret;
                }
                if (altSeparator) {
                    realPath = realPath.replace(new RegExp(altSeparator, "g"), "/");
                }
                try {
                    if (dojo) {
                        require({
                            async: !(synchronous)
                        }, [realPath], function (g) {
                                ret = g;
                        });
                    } else {
                        require([realPath], function (g) {
                            ret = g;
                        });
                    }
                } catch (e) {
                    if (loud) {
                        throw e;
                    }
                }
                return ret;
            };
        }
    });

    return module;
});