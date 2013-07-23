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
                extCfg = this.config.extendedWindowConfig,
                options = extCfg && extCfg.options,
                url = (extCfg && extCfg.url) || "";
            options += ", " + (extCfg && extCfg.configMap && extCfg.configMap[this.getAddress()]);
            if (!windowRef.window) {
                windowRef.window = this.createWindow(url, options);
                // set window up to participate
                this.pendingCalls.push(callback);
                // TODO: use html 5 messaging instead if available
                windowRef.window.smithyCallback = function (option, win) {
                    var lastwin = window.lastwin;
                    // Most of the complexity here is having to handle
                    // the fact that the only difference between a refresh
                    // and a close on the extended window is that you get
                    // both "loaded" and "unloaded" events.
                    // For a refresh the layout is stored and re-rendered.
                    if (option === "loaded") {
                        // this was a refresh
                        if (lastwin && lastwin.window === win) {
                            windowRef.window = win;
                            that.unstashLayout(window.lastwin.layout, true);
                            that.render();
                        } else {
                            that.pendingCalls.forEach(function (func) {
                                func();
                            });
                            that.pendingCalls = [];
                        }
                    } else if (option === "unloaded") {
                        // store window layout in case it is a refresh.
                        if (windowRef.window === win) {
                            window.lastwin = {
                                window: win,
                                callback: windowRef.window.smithyCallback,
                                layout: that.stashLayout()
                            }
                            that.clearSubAreas();
                            that.config.windowRef.window = undefined;
                            if (that.view) {
                                that.view.destroy();
                                delete that.view;
                                that.rendered = that.renderedOnce = false;
                            }
                        }
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

        createWindow: function (url, options) {
            var ret = window.lastwin && window.lastwin.window;
            if (!ret || ret.name !== this.getAddress()) {
                ret = window.open(url, this.getAddress(), options);
            }
            return ret;
        },

        /**
         * windows can't go any higher so just do a resize on the view.
         */
        resize: function () {
            if (this.view) {
                this.view.resize();
            }
        }
    });

    return module;

});
