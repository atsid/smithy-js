/**
 * @class Logger
 * @extends Object
 * Logger. Provides methods for trace(), debug(), info(), warn() and error().
 * @param {String} logLevel Supported levels are TRACE, DEBUG, INFO, WARN, ERROR
 */
define([
], function () {
    var module = function (logLevel, alternateConsole, srcName) {

        /**
         * @constructor Ensures that console is available if it isn't passed to constructor and sets log level.
         */
        var levels = {
            TRACE: 1,
            DEBUG: 2,
            INFO: 3,
            WARN: 4,
            ERROR: 5
        }, doLog, plugins = [];

        logLevel = levels[logLevel.toUpperCase()];

        if (!alternateConsole) {
            alternateConsole = console;
        }

        if (typeof (srcName) === 'undefined') {
            srcName = '';
        }

        doLog = function (level, message, obj, encode, args) {
            var logger = alternateConsole[level] || alternateConsole.info;

            message = srcName + message;

            if (encode) {

                if (obj) {
                    logger.call(alternateConsole, message + " --> " + JSON.stringify(obj));
                } else {
                    logger.call(alternateConsole, message);
                }
            } else {
                try {
                    if (args[0]) {
                        args[0] = srcName + args[0];
                    }
                    logger.apply(alternateConsole, args);
                } catch (e) {
                    logger(message, obj, encode, args);
                }
            }

            plugins.forEach(function (plugin) {
                plugin.log(level, message, obj, encode);
            });

        };

        /**
         * Add a new log plugin that messages will be pushed to in addition to the default logger.
         * Plugins should have a single method "log", which accepts a level, message, optional object, and optional encode boolean.
         */
        this.addPlugin = function (plugin) {
            plugins.push(plugin);
        };

        /**
         * print a log TRACE message
         * @param {Object} message - text to print
         * @param {Object} obj - optional object to pass
         * @param {Object} encode - flag indicating whether to stringify the passed object,
         * or send it directly, which will result in a DOM link in Firebug
         */
        this.trace = function (message, obj, encode) {
            if (logLevel <= levels.TRACE) {
                doLog("debug", message, obj, encode, arguments);
            }
        };

        /**
         * print a log DEBUG message
         * @param {Object} message - text to print
         * @param {Object} obj - optional object to pass
         * @param {Object} encode - flag indicating whether to stringify the passed object,
         * or send it directly, which will result in a DOM link in Firebug
         */
        this.debug = function (message, obj, encode) {
            if (logLevel <= levels.DEBUG) {
                doLog("debug", message, obj, encode, arguments);
            }
        };

        /**
         * print a log INFO message
         * @param {Object} message - text to print
         * @param {Object} obj - optional object to pass
         * @param {Object} encode - flag indicating whether to stringify the passed object,
         * or send it directly, which will result in a DOM link in Firebug
         */
        this.info = function (message, obj, encode) {
            if (logLevel <= levels.INFO) {
                doLog("info", message, obj, encode, arguments);
            }
        };

        /**
         * print a log WARN message
         * @param {Object} message - text to print
         * @param {Object} obj - optional object to pass
         * @param {Object} encode - flag indicating whether to stringify the passed object,
         * or send it directly, which will result in a DOM link in Firebug
         */
        this.warn = function (message, obj, encode) {
            if (logLevel <= levels.WARN) {
                doLog("warn", message, obj, encode, arguments);
            }
        };

        /**
         * print a log ERROR message
         * @param {Object} message - text to print
         * @param {Object} obj - optional object to pass
         * @param {Object} encode - flag indicating whether to stringify the passed object,
         * or send it directly, which will result in a DOM link in Firebug
         */
        this.error = function (message, obj, encode) {
            if (logLevel <= levels.ERROR) {
                doLog("error", message, obj, encode, arguments);
            }
        };

        /**
         * Creates a new timer under the given name. Call console.timeEnd(name)
         * with the same name to stop the timer and print the time elapsed.
         * @param {Object} name Name of timer to create.
         */
        this.time = function (name) {
            alternateConsole.time.apply(alternateConsole, arguments);
        };

        /**
         * Stops a timer created by a call to console.time(name) and writes
         * the time elapsed.
         * @param {Object} name name of the timer to stop and print.
         */
        this.timeEnd = function (name) {
            alternateConsole.timeEnd.apply(alternateConsole, arguments);
        };
        //end of constructor
    };

    return module;
});
