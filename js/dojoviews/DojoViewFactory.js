"use strict";
/**
 * @class DojoViewFactory
 */
define([
    "../declare",
    "dojo/dom",
    "dojo/_base/window",
    "./DojoBorderView",
    "./DojoTabView",
    "./DojoArrayView",
    "smithy/util"
], function (
    declare,
    Dom,
    DojoWindow,
    BorderContainer,
    TabContainer,
    ArrayView,
    Util
) {
    var util = new Util(),
        module = declare(null, {
        constructor: function (config) {
            this.config = util.mixin({configMap: {}, root: "dojoRoot"}, config);
        },

        createView: function (area, mode) {
            var view, newWindow, ele, doc = DojoWindow.doc,
                areaConfig = this.config.configMap[area.getAddress()],
                tag = (area.isWindow ? this.config.root : area.getAddress());
            if (area.isWindow && !Dom.byId(this.config.root)) {
                ele = doc.createElement("div");
                ele.setAttribute("id", this.config.root);
                DojoWindow.body().appendChild(ele);
            }
            if (mode === "borders") {
                view = new BorderContainer(areaConfig || {
                    style: "height:100%; width:100%"
                }, tag);
            } else if (mode === "tabs") {
                view = new TabContainer(areaConfig || {
                    style: "height:100%; width:100%"
                }, tag);
            } else if (mode === "rows" || mode === "columns") {
                view = new ArrayView(areaConfig || {
                    mode: mode
                }, tag);
            }
            return view;
        }

    });

    return module;

});


