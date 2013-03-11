/*
 require(["dojo/ready", "dijit/layout/AccordionContainer", "dijit/layout/ContentPane"], function(ready, AccordionContainer, ContentPane){
 ready(function(){
 var aContainer = new AccordionContainer({style:"height: 300px"}, "markup");
 aContainer.addChild(new ContentPane({
 title: "This is a content pane",
 content: "Hi!"
 }));
 aContainer.addChild(new ContentPane({
 title:"This is as well",
 content:"Hi how are you?"
 }));
 aContainer.addChild(new ContentPane({
 title:"This too",
 content:"Hello im fine.. thnx"
 }));
 aContainer.startup();
 });
 });
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
            this.style = "width: 20%";
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
                        var center = gs.getArea("/windows[0]/center");
                        center.removeGadget();
                        center = gs.loadGadgetTo(descriptor.name, "/windows[0]/center", false);
                        gs.routePage();
                    }
                }));
            }, this);
            this.addChild(loadGadgets);
            this.startup();
        }
    });
});
