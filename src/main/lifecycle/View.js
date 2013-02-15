/**
 * Component lifecycle methods related to view rendering. Any component that displays a view
 * should include the View lifecycle, so that a standard lifecycle can be applied.
 * This has additional benefits to development, including (a) the establishment of registry for runtime
 * introspection of functionality, and (b) helper methods available to the component for boilerplate reduction.
 *
 * Any component utilizing View should use the following practices:
 * 1) Override the setupView method, and include all rendering/widget creation in this method only.
 * This will ensure that the lifecycle is properly applied, and that elements such as the registry stay up-to-date.
 */
define([
    "../declare",
    "./Registry"
], function (
    declare,
    Registry
) {
    var module = declare(null, {

        constructor: function () {
            //all lifecycles should init the registry if it hasn't already been done.
            if (!this.registry) {
                this.registry = new Registry();
            }
        },

        /**
         * Standard lifecycle method for setup.
         * Provides a consistent location to setup rendering for a component that uses views.
         * Be sure to call this.inherited(arguments) to ensure parent components are initialized for rendering.
         */
        setupView : function () {
            if (this.statusChange) {
                this.statusChange("VIEW-UP");
            }
        },

        /**
         * Standard lifecycle method for teardown.
         * Provides a consistent location to teardown views for a component that uses views.
         * Most components would not need to re-implement this method.
         */
        teardownView : function () {
        }
    });

    return module;
});