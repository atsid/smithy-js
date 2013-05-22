/**
 * Component lifecycle methods related to services. Any component that wants to use abstracted ajax
 * should include the Services lifecycle, so that a standard lifecycle can be applied.
 * This has additional benefits to development, including (a) the establishment of registry for runtime
 * introspection of functionality, and (b) helper methods available to the component for boilerplate reduction.
 *
 * Any component utilizing Service should use the following practices:
 * 1) Override the setupServices method, and include all store/ajax-related setup in this method only.
 * 2) Use the registerService helper method to do all service setup within setupServices.
 * This will ensure that the lifecycle is properly applied, and that elements such as the registry stay up-to-date.
 */
define([
    "../declare",
    "./Registry",
    "../util"
], function (
    declare,
    Registry,
    Util
) {
    var body,
        util = new Util(),
        module = declare(null, body = {

        constructor: function (config) {
            //all lifecycles should init the registry if it hasn't already been done.
            if (!this.registry) {
                this.registry = new Registry();
            }
            this.serviceFactory = config && config.serviceFactory;

            // noop service methods if there isn't service support.
            if (!config.features.hasServices) {
                Object.keys(body).forEach(function (key, idx, arr) {
                    var val = body[key];
                    if (typeof val === 'function' &&
                        body.hasOwnProperty(key) &&
                        key !== "constructor") {
                        this[key] = function () {};
                    }
                }, this);
            }
        },

        /**
         * Standard lifecycle method for setup.
         * Provides a consistent location to setup service stores for a component that uses ajax.
         * Should typically be populated with registerService calls.
         * Be sure to call this.inherited(arguments) to ensure parent components are initialized for services.
         */
        setupServices: function () {
        },

        /**
         * Standard lifecycle method for teardown.
         * Provides a consistent location to teardown services for a component that uses ajax.
         * Default impl ensures that all services are removed from registry and top-level functions removed.
         * Most components should not need to reimplement this method.
         */
        teardownServices: function () {
            var registry = this.registry,
                services = this.registry.getRegistryLocation(this.registry.locServices);
            Object.keys(services).forEach(function (key, idx, obj) {
                registry.removeFromRegistry(this.registry.locServices, key);
            }, this);
        },

        /**
         * Loads a Service instance for use by the gadget.
         * The callbacks will be used for all service methods (they can be overridden at method invocation time).
         *
         * The Service instance will be added directly to the gadget using its name, like gadget.CaseService,
         * so you can call it easily, such as this.CaseService.readCase({args}, {plugins/callbacks});
         * @param service - the service name or an already loaded smd.
         * @param plugins - plugins to apply to the service.
         */
        registerService: function (service, plugins) {
            var svc;
            if (typeof service === "string") {
                svc = this.serviceFactory.getServiceByName(service, plugins);
            } else if (service.schemaId) {
                svc = this.serviceFactory.getService(service, plugins);
            }
            this[svc.name] = svc;
            this.registry.addToRegistry(this.registry.locServices, svc.name, svc);
            return svc;
        }
    });

    return module;
});
