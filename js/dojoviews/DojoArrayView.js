"use strict";
/**
 * @class SMITHY/dojoviews/DojoArrayView
 */

define([
    "../declare",
    "./LayoutContainer"
], function (
    declare,
    LayoutContainer
) {
    var module = declare(LayoutContainer, {
        constructor: function (config) {
            var columns = "columns",
                mode = this.implementsMode = config.mode || columns;
            this.columnsMode = mode === columns;
        },

        /**
         * Add a child to the layout. If an area does not exist at the index specified, area(s)
         * will be created. Specifying an index that already has a child results in an error.
         * @param {dijit._WidgetBase | Element} view Child widget or node to add as a child.
         * @param {Number} index Index of area to add as a child.
         * @param {Boolean} doRender True to resize child.
         */
        addChild: function (view, index, doRender) {
            this.inherited(arguments);
        },

        /**
         * Remove child from layout
         * @param {dijit._WidgetBase | HTMLElement} widgetOrNode Child to remove
         */
        removeChild: function (childView) {
            this.inherited(arguments);
        },

        /**
         * Test if view is a child.
         * @param {dijit._WidgetBase} childView View to test if it is a child.
         * @returns {boolean} True if view is a child.
         */
        hasChild: function (childView) {
            var children = this.getChildren(),
                cidx = children.indexOf(childView);
            return cidx > -1;
        },

        /**
         * Method called after the domNode for this widget has been placed in the document.
         */
        startup: function () {
            this.inherited(arguments);
        }

    });

    return module;

});
