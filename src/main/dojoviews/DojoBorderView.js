/**
 * @class SMITHY/DojoBorderView
 * View implementation for Dojo Border Container to support smithy "borders"
 * layout mode.
 */

define([
    "../declare",
    "dijit/layout/BorderContainer"
], function (
    declare,
    BorderContainer
) {
    var module = declare(BorderContainer, {
        constructor: function (config) {
            this.implementsMode = "borders";
        },

        addChild: function (view, region) {
            view.region = region;
            this.inherited(arguments);
        },

        removeChild: function (childView) {
            this.inherited(arguments);
        },

        hasChild: function (childView) {
            var cidx = this.getIndexOfChild(childView);
            return (cidx > -1);
        },

        startup: function () {
            this.inherited(arguments);
        }

    });

    return module;

});
