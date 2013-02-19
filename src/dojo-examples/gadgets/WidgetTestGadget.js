define([
    "smithy/declare",
    "smithy/Gadget",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/Toolbar",
    "dijit/form/Button",
    "dijit/form/DropDownButton",
    "dijit/form/ComboButton",
    "dijit/form/ToggleButton",
    "dijit/form/DateTextBox",
    "dijit/form/TextBox",
    "dijit/form/ComboBox",
    "dijit/form/TimeTextBox",
    "dijit/form/CheckBox",
    "dijit/form/RadioButton",
    "dijit/form/Select"
], function (
    declare,
    Gadget,
    BorderContainer,
    ContentPane,
    Toolbar,
    Button,
    DropDownButton,
    ComboButton,
    ToggleButton,
    DateTextBox,
    TextBox,
    ComboBox,
    TimeTextBox,
    CheckBox,
    RadioButton,
    Select
) {

/**
 * @class WidgetTestGadget
 * Tests display of various common widgets for styling purposes.
 */

    return declare([ContentPane, Gadget], {

        name: "WidgetTestGadget",

        constructor: function () {
            this.title = 'Widget Test Gadget';
        },

        setupView: function () {
            this.inherited(arguments);
            var bc = new BorderContainer({gutters: false, style: "height: 100%; width: 100%"}),
                toolbar,
                center;
            bc.placeAt(this.domNode);

            toolbar = new Toolbar({region: "top"});
            bc.addChild(toolbar);

            this.addControls(toolbar.domNode);

            center = new ContentPane({region: "center"});
            bc.addChild(center);

            this.addControls(center.domNode);

            bc.startup();
        },

        addControls: function (targetNode) {

            var buttonGroup;
            buttonGroup = dojo.create("div", {style: "float: right"}, targetNode);
            (new Button({
                label: "b7"
            })).placeAt(buttonGroup);
            (new ToggleButton({
                label: "b8",
                showLabel: false,
                iconClass: "dijitEditorIcon dijitEditorIconOutdent"
            })).placeAt(buttonGroup);
            (new Button({
                label: "b9",
                iconClass: "dijitEditorIcon dijitEditorIconIndent"
            })).placeAt(buttonGroup);

            (new Button({
                label: "button"
            })).placeAt(targetNode);

            (new DropDownButton({
                label: "select"
            })).placeAt(targetNode);

            (new ComboButton({
                label: "combo"
            })).placeAt(targetNode);

            (new ToggleButton({
                label: "toggle button"
            })).placeAt(targetNode);

            (new DateTextBox({
                label: "date text box"
            })).placeAt(targetNode);

            (new TimeTextBox({
                label: "currency text box"
            })).placeAt(targetNode);

            (new TextBox({
                label: "text box"
            })).placeAt(targetNode);

            (new Select({
                label: "select"
            })).placeAt(targetNode);

            dojo.addClass(new Button({label: "Primary"}).placeAt(targetNode).domNode, "primary");
            dojo.addClass(new Button({label: "Danger"}).placeAt(targetNode).domNode, "danger");

            (new CheckBox({
                label: "text box"
            })).placeAt(targetNode);

            (new RadioButton({
                label: "text box"
            })).placeAt(targetNode);

//            (new ComboBox({
//                label: "combo box"
//            })).placeAt(targetNode);


            buttonGroup = dojo.create("div", {}, targetNode);
            (new Button({
                label: "b1"
            })).placeAt(buttonGroup);
            (new ToggleButton({
                label: "b2",
                showLabel: false,
                iconClass: "dijitEditorIcon dijitEditorIconOutdent"
            })).placeAt(buttonGroup);
            (new Button({
                label: "b3",
                iconClass: "dijitEditorIcon dijitEditorIconIndent"
            })).placeAt(buttonGroup);

            buttonGroup = dojo.create("div", {}, targetNode);
            (new Button({
                label: "b4",
                iconClass: "icon-print"
            })).placeAt(buttonGroup);
            (new ToggleButton({
                label: "b5",
                iconClass: "icon-highlight",
                showLabel: false
            })).placeAt(buttonGroup);
            (new Button({
                label: "b6"
            })).placeAt(buttonGroup);
        }
    });
});
