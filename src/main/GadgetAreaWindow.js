/**
 * @class SMITHY/GadgetAreaWindow
 */
define([
    "./declare",
    "./GadgetArea"
], function (
    declare,
    GadgetArea
) {

    var module = declare([GadgetArea], {

        constructor: function (config) {
            var windowRef = this.config.windowRef = {window: (config && config.window)};
            if (windowRef.window) {
                windowRef.window.smithyProxy = {
                    viewFactory: this.config.viewFactory,
                    gadgetFactory: this.config.gadgetFactory
                };
            }
            this.pendingCalls = [];
            this.isWindow = true;
        },

        whenWindowCreated: function (callback) {
            // if this is the first time rendering then
            // create the window.
            var that = this,
                windowRef = this.config.windowRef,
                url = (this.config.extendedWindowConfig && this.config.extendedWindowConfig.url) || "";
            if (!windowRef.window) {
                windowRef.window = this.createWindow(url);
                // set window up to participate
                this.pendingCalls.push(callback);
                // TODO: use html 5 messaging instead if available
                windowRef.window.smithyCallback = function (option) {
                    if (option === "loaded") {
                        that.pendingCalls.forEach(function (func) {
                            func();
                        });
                    } else if (option === "unloaded") {
                        that.config.parent.removeSubArea(that);
                    }
                };
            } else if (!windowRef.window.smithyProxy) {
                this.pendingCalls.push(callback);
            } else {
                callback();
            }
        },

        render: function () {
            var that = this, args = arguments;
            this.whenWindowCreated(function () {
                that.inherited(args);
                that.view.startup();
                that.config.windowRef.window.onresize = function(event) {
                    that.view.resize();
                };
                that.rendered = true;
            });
        },

        createWindow: function (url) {
            var ret = window.open(url, this.getAddress(), "height=800,width=900");
            return ret;
        }

    });

    return module;

});
