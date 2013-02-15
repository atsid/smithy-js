/**
 * @class SMITHY/Slag
 * Smithy framework element that acts a general data repository using web storage if
 * requested and available.
 * config {
     *    changeEvent - {function} function accepting a single object of form :
     *        (path: pathToTheData, oldValue: OldValue, newValue: NewValue).
     *    useWebStorage - true if you want the data stored in local storage instead of on this object.
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

            this.changeEvent = config.changeEvent || function () {};

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
                        that.storage.getLocalObject(key);
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
            return this.storage.getLocalObject(path);
        },

        /**
         * Set the data an fire a change notification.
         * @param path - the path to the data
         * @param value - the new value
         */
        set: function (path, value) {
            var oldValue = this.storage.getLocalObject(path);
            this.storage.setLocalObject(path, value);
            this.changeEvent({path: path, oldValue: oldValue, newValue: value});
        }
    });

    return module;

});
