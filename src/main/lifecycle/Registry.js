define([
    "../declare",
    "../util"
], function (
    declare,
    Util
) {
    var util = new Util(),
        module = declare(null, {

        locPublishes: "publishes",
        locSubscribes: "subscribes",
        locServices: "services",
        locPreferences: "preferences",
        locGadgets: "gadgets",

        constructor: function () {
            var registry = {};
            registry[this.locPublishes] = {};
            registry[this.locSubscribes] = {};

            this.getRegistryLocation = function (registryLocation) {
                if (!registry[registryLocation]) {
                    registry[registryLocation] = {};
                }
                return registry[registryLocation];
            };

            this.getRegistryItem = function (registryLocation, name) {
                return this.getRegistryLocation(registryLocation)[name];
            };

            this.addToRegistry = function (registryLocation, name, obj) {
                this.getRegistryLocation(registryLocation)[name] = obj;
            };

            this.removeFromRegistry = function (registryLocation, name) {
                if (util.isDefined(this.getRegistryLocation(registryLocation)[name])) {
                    delete registry[registryLocation][name];
                }
            };

            this.enumerateEntries = function (registryLocation, predicate, scope) {
                var loc = this.getRegistryLocation(registryLocation);
                if (util.isDefined(loc)) {
                    Object.keys(loc).forEach(function (key, idx, obj) {
                        var val = loc[key];
                        predicate.call(scope, val, key, loc);
                    });
                }
            };
        }
    });

    return module;
});

