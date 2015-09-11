"use strict";
/**
 * Mixin class containing convenience methods for gadget lifecycle management.
 * Intended to be mixed into base Gadget, so we can add these methods without disrupting the
 * core elements of existing Gadget functionality.
 */
define([
    "../declare",
    "./Registry",
    "./Messaging",
    "./Services",
    "./View"
], function (
    declare,
    Registry,
    Messaging,
    Services,
    View
) {
    var module = declare([Messaging, Services, View], {

        constructor: function (config) {
            // erase status change if bullhorn isn't present.
            if (!config.features.hasMessaging) {
                this.statusChange = function () {};
            }
        },

        statusChange: function (status) {
            this.pub.GadgetStatusChange({name: this.name, address: this.parent.getAddress(), status: status});
        },

        setupLifecycle: function () {
            //this order is required due to pref utilization of messaging and services
            this.setupMessaging();
            this.statusChange("MESSAGING-UP");
            this.setupServices();
            this.statusChange("SERVICES-UP");
        },

        teardownLifecycle: function () {
            this.statusChange("DESTROYING");
            this.teardownView();
            this.statusChange("VIEW-DN");
            this.teardownServices();
            this.statusChange("SERVICES-DN");
            this.teardownMessaging();
        }

    });

    return module;
});