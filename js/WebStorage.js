"use strict";
/**
 * @class WebStorage
 * Wrap the global WebStorage objects in a utility class that provides storage
 * of name-spaced objects.
 */
define([
    "./declare"
], function (
    declare
) {
    var module = declare(null, {

        constructor: function (config) {
            var namespace = (config && config.namespace) || this.declaredClass,
                getNamespaceObject = function (key, storage) {
                    var item = JSON.parse(storage.getItem(namespace));
                    return item[key];
                },
                setNamespaceObject = function (key, value, storage) {
                    var item = JSON.parse(storage.getItem(namespace));
                    item[key] = value;
                    storage.setItem(namespace, JSON.stringify(item));
                };

            if (!localStorage) {
                throw new Error("Web storage is not supported by this runtime.");
            }

            Object.defineProperty(this, "localStorage", {
                get: function () {
                    return localStorage;
                },
                set: function (value) {
                    throw new Error("The storage attribute is protected.");
                },
                enumerable: true
            });

            Object.defineProperty(this, "sessionStorage", {
                get: function () {
                    return sessionStorage;
                },
                set: function (value) {
                    throw new Error("The storage attribute is protected.");
                },
                enumerable: true
            });

            if (!this.localStorage.getItem(namespace)) {
                this.localStorage.setItem(namespace, "{}");
            }
            if (!this.sessionStorage.getItem(namespace)) {
                this.sessionStorage.setItem(namespace, "{}");
            }

            /**
             * Is the local storage represented by this namespace empty?
             * @returns boolean true if empty.
             */
            this.isLocalEmpty = function () {
                return this.localStorage.getItem(namespace) === "{}";
            };

            /**
             * Is the session storage represented by this namespace empty?
             * @returns boolean true if empty.
             */
            this.isSessionEmpty = function () {
                return this.sessionStorage.getItem(namespace) === "{}";
            };

            /**
             * Clear the session Storage for this namespace.
             * @returns undefined
             */
            this.clearSession = function () {
                this.sessionStorage.setItem(namespace, "{}");
            };

            /**
             * Clear the local Storage for this namespace.
             * @returns undefined
             */
            this.clearLocal = function () {
                this.localStorage.setItem(namespace, "{}");
            };

            /**
             * Gets the parsed object from local storage represented by the given key.
             * @param key the key identifier of the object.
             * @returns the local storage item as an object.
             */
            this.getLocalObject = function (key) {
                return getNamespaceObject(key, this.localStorage);
            };

            /**
             * Stores the value for the passed key in local storage.
             * @param key the key identifier of the object.
             * @param value the value to set.
             */
            this.setLocalObject = function (key, value) {
                setNamespaceObject(key, value, this.localStorage);
            };

            /**
             * Gets the parsed object from session storage represented by the given key.
             * @param key the key identifier of the object.
             * @returns the local storage item as an object.
             */
            this.getSessionObject = function (key) {
                return getNamespaceObject(key, this.sessionStorage);
            };

            /**
             * Stores the value for the passed key in session storage.
             * @param key the key identifier of the object.
             * @param value the value to set.
             */
            this.setSessionObject = function (key, value) {
                setNamespaceObject(key, value, this.sessionStorage);
            };

        }
    });
    return module;
});
