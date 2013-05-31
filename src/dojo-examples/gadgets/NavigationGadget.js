/*
 */
define([
    "smithy/declare",
    "smithy/ToolGadget",
    "dijit/form/Button",
    "dijit/_Container",
    "dijit/layout/ContentPane",
    "dijit/layout/AccordionContainer"
], function (
    declare,
    ToolGadget,
    Button,
    Container,
    ContentPane,
    AccordionContainer
) {

/**
 * @class SimpleGadget
 * A simple gadget for test purposes.
 */

    return declare([AccordionContainer, ToolGadget], {

        constructor: function (config) {
            this.style = "width: 30%";
        },

        name: "NavigationGadget",

        title: "NavigationGadget",

        setupView: function () {
            var that = this,
                gs = this.gadgetSpace,
                container = declare([Container, ContentPane], {}),
                loadGadgets = new container({
                    title: "Load Gadgets"
                });

            gs.enumerateGadgetDescriptors(function (descriptor) {
                loadGadgets.addChild(new Button({
                    label: "Load " + descriptor.name,
                    onClick: function () {
                        // If you want to do adhoc routing do the following.
//                        var center = gs.getArea("/windows[0]/center");
//                        center.removeGadget();
//                        center = gs.loadGadgetTo(descriptor.name, "/windows[0]/center", false);
//                        gs.routePage();
                        // If you are using a custom routing specification do the following
                        // to route to a particular entry.
                        if (descriptor.gadget === "TitleGadget") {
                            gs.routeTo(descriptor.name, {applicationTitle: "Loaded From Navigator"});
                        } else {
                            gs.routeTo(descriptor.name);
                        }
                    }
                }));
            }, this);
            this.addChild(loadGadgets);
            this.startup();
        }
    });
});
