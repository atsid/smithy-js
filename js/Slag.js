"use strict";
/**
 * @class SMITHY/Slag
 * Smithy framework element that acts as a general data repository using web storage if
 * requested and available.
 * config {
     *    changeEvent - {function} function accepting a single object of form :
     *        (path: pathToTheData, oldValue: OldValue, newValue: NewValue).
     *    useWebStorage - truthy if you want the data stored in web storage instead of on this object,
     *                    "session" if all data should be stored in session storage.
     * }
 */
define([
    "./declare",
    "./WebStorage"
], function (
    declare,
    WebStorage
) {
    var module = declare(null, {

        /**
         * setup storage and event.
         * @param config
         */
        constructor: function (config) {
            var that = this;

            this.config = config;
            this.changeEvent = (config && config.changeEvent) || function () {};

            if (config.useWebStorage) {
                this.storage = new WebStorage({namespace: "SmithySlag"});
            } else {
                this.data = {};
                this.storage = {
                    setLocalObject: function (key, value) {
                        that.data[key] = value;
                    },
                    getLocalObject: function (key) {
                        return that.data[key];
                    },
                    setSessionObject: function (key, value) {
                        that.storage.setLocalObject(key, value);
                    },
                    getSessionObject: function (key) {
                        return that.storage.getLocalObject(key);
                    }
                };
            }
        },

        /**
         * Get data at path.
         * @param path - {string} the path to the data.
         * @return the requested data.
         */
        get: function (path) {
            var ret = this.storage.getLocalObject(path) ||
                this.storage.getSessionObject(path);
            return ret;
        },

        /**
         * Set the data and fire a change notification.
         * @param path - the path to the data
         * @param value - the new value
         * @param options - object like {session: true|false}
         */
        set: function (path, value, options) {
            var oldValue,
                useSession = (options && options.session) ||
                    (this.config && (this.config.useWebStorage === 'session'));
            if (useSession) {
                oldValue =  this.storage.getSessionObject(path);
                this.storage.setSessionObject(path, value);
            } else {
                oldValue =  this.storage.getLocalObject(path);
                this.storage.setLocalObject(path, value);
            }
            this.changeEvent({path: path, oldValue: oldValue, newValue: value});
        }
    });

    return module;

});
