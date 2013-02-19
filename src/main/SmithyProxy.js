/**
 * @class SMITHY/SmithProxy
 * This class sets up a proxy object usable by smithy on the current window to allow
 * creation of views and gadgets to occur in the javascript environment
 * of that window.
 */
define([
    "./declare",
    "./util"
], function (
    declare,
    Util
) {
    var util = new Util(),
        module = declare(null, {
        constructor: function (config) {
            if (util.isUndefined(config.gadgetFactory)) {
                throw new Error("Must supply a gadgetFactory to a SmithyProxy");
            }
            if (util.isUndefined(config.viewFactory)) {
                throw new Error("Must supply a viewFactory to a SmithyProxy");
            }
            if (util.isUndefined(window.smithyCallback)) {
                throw new Error("No smithyCallback defined for this window");
            }
            if (!util.isUndefined(window.smithyProxy)) {
                throw new Error("There is a smithy proxy already defined for this window.");
            }
            this.gadgetFactory = config.gadgetFactory;
            this.viewFactory = config.viewFactory;
            if (window && !window.smithyProxy) {
                window.smithyProxy = this;
            }
            // TODO: use html 5 messaging if available instead.
            window.smithyCallback("loaded");
            window.onbeforeunload = function () {
                window.smithyCallback("unloaded");
            };
        }
    });

    return module;
});
