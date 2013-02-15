define([
    "ORE/lang",
    "ORE/assert",
    "ORE/NoAbstractMethodImplError",
    "ORE/InvalidArgumentError",
    "SMITHY/ToolGadget",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/form/Button",
    "dijit/form/TextBox",
    "dijit/form/HorizontalSlider",
    "dijit/form/Select"
], function (
    OreLang,
    Assert,
    NoAbstractMethodImplError,
    InvalidArgumentError,
    ToolGadget,
    DojoLang,
    ContentPane,
    Button,
    TextBox,
    HorizontalSlider,
    Select
) {

/**
 * @class ToolBarGadget
 * A tool gadget gadget for test purposes.
 */

    return OreLang.declare([ContentPane, ToolGadget], {

        name: "ToolBarGadget",

        setupMessaging: function () {

            this.registerPublisher("DisplayText");

            // listen for gadget and gadget area activity.
            this.registerFrameworkSubscriber("GadgetSpaceStatusChange", function (message) {

                // grab initial set of gadgets and areas.
                this.gadgetSpace.traverseAreas(function (area) {
                    if (area) {
                        if (area.hasGadget()) {
                            this.activeGadgets.addOption({label: area.getAddress(), value: area.getAddress()});
                            this.activeGadgets2.addOption({label: area.getAddress(), value: area.getAddress()});
                        }
                        this.areas.addOption({label: area.getAddress(), value: area.getAddress()});
                    }
                }, this);
                this.gadgetSpace.enumerateGadgetDescriptors(function (descriptor) {
                    this.registeredGadgets.addOption({label: descriptor.name, value: descriptor});
                }, this);

                this.registerFrameworkSubscriber("GadgetStatusChange", function (message) {
                    this.activeGadgets.addOption({label: message.address, value: message.address});
                    this.activeGadgets2.addOption({label: message.address, value: message.address});
                }, function (message) {
                    return message.status === "VIEW-UP";
                }, false);

                this.registerFrameworkSubscriber("AreaStatusChange", function (message) {
                    this.areas.addOption({label: message.address, value: message.address});
                }, function (message) {
                    return message.status === "CREATED";
                }, false);

                this.registerFrameworkSubscriber("AreaStatusChange", function (message) {
                    this.areas.removeOption({label: message.address, value: message.address});
                }, function (message) {
                    return message.status === "DESTROYED";
                }, false);

                this.registerFrameworkSubscriber("GadgetStatusChange", function (message) {
                    this.activeGadgets.removeOption(message.address);
                    this.activeGadgets2.removeOption(message.address);
                }, function (message) {
                    return message.status === "VIEW-DN";
                }, false);

                this.registerFrameworkSubscriber("GadgetRegistrationEvent", function (message) {
                    this.registeredGadgets.addOption({label: message.name, value: message.name});
                }, function (message) {
                    return message.status === "GADGETADDED";
                }, false);

                this.registerFrameworkSubscriber("GadgetRegistrationEvent", function (message) {
                    this.registeredGadgets.removeOption({label: message.name, value: message.name});
                }, function (message) {
                    return message.status === "GADGETREMOVED";
                }, false);
            }, function (message) {
                return message.status === "RENDERED";
            }, false);

            this.registerSubscriber("DisplayText", function (message) {
                this.layoutText = message.text;
            }, null, false);
        },

        setupView: function () {
            this.inherited(arguments);
            this.registeredGadgets = new Select({name: "RegisteredGadgets" });
            this.activeGadgets = new Select({name: "ActiveGadgets" });
            this.activeGadgets2 = new Select({name: "ActiveGadgets2" });
            this.areas = new Select({name: "Areas" });
            this.remove = new Button({label: "Remove"});
            this.serialize = new Button({label: "Serialize"});
            this.realize = new Button({label: "Realize"});
            this.loadTo = new Button({label: "Load To"});
            this.loadAddress = new TextBox().placeAt(this.domNode);

            this.loadTo.placeAt(this.domNode);
            this.registeredGadgets.placeAt(this.domNode);
            this.loadAddress.placeAt(this.domNode);
            this.remove.placeAt(this.domNode);
            this.activeGadgets2.placeAt(this.domNode);

            if (this.config.features.hasModels) {
                this.serialize.placeAt(this.domNode);
                this.areas.placeAt(this.domNode);
                this.realize.placeAt(this.domNode);
            }

            this.loadTo.onClick = DojoLang.hitch(this, function () {
                var area = this.gadgetSpace.loadGadgetTo(
                    this.registeredGadgets.get('value').name,
                    this.loadAddress.get('value'),
                    true
                );
                area.render();
            });

            this.remove.onClick = DojoLang.hitch(this, function () {
                var area = this.gadgetSpace.removeArea(
                    this.activeGadgets2.get('value')
                );
            });

            this.serialize.onClick = DojoLang.hitch(this, function () {
                var text, area = this.gadgetSpace.getArea(
                    this.areas.get('value')
                );
                text = area.getSerializedLayout();
                this.pub.DisplayText({
                    text: JSON.stringify(JSON.parse(text), null, 4)
                });
            });

            this.realize.onClick = DojoLang.hitch(this, function () {
                this.gadgetSpace.realizeLayout(this.layoutText);
            });
        }
    });
});