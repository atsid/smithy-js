/**
 * @class SMITHY/DojoBorderView
 * View implementation for Dojo Tab Container to support smithy "tabs"
 * layout mode.
 */
define([
    "../declare",
    "dijit/layout/TabContainer"
], function (
    declare,
    TabContainer
) {
    var module = declare(TabContainer, {
        constructor: function (config) {
            this.implementsMode = "tabs";
        },

        addChild: function (view) {
            this.inherited(arguments);
            //this.set("title", view.title);
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


