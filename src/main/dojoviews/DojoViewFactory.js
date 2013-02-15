/**
 * @class DojoViewFactory
 */
define([
    "../declare",
    "dojo/dom",
    "dojo/_base/window",
    "./DojoBorderView",
    "./DojoTabView"
], function (
    declare,
    Dom,
    DojoWindow,
    BorderContainer,
    TabContainer
) {
    var module = declare(null, {
        constructor: function (config) {
            this.rootTag = (config && config.root) || "dojoRoot";
        },

        createView: function (area, mode) {
            var view, newWindow, ele, doc = DojoWindow.doc,
                tag = (area.isWindow ? this.rootTag : area.getAddress());
            if (area.isWindow && !Dom.byId(this.rootTag)) {
                ele = doc.createElement("div");
                ele.setAttribute("id", this.rootTag);
                DojoWindow.body().appendChild(ele);
            }
            if (mode === "borders") {
                view = new BorderContainer({
                    style: "height:100%; width:100%"
                }, tag);
            } else if (mode === "tabs") {
                view = new TabContainer({
                    style: "height:100%; width:100%"
                }, tag);
            }
            return view;
        }

    });

    return module;

});


