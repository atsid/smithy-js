require([
    "smithy/GadgetSpace",
    "smithy/GadgetArea",
    "smithy/Gadget",
    "smithy/GadgetFactory",
    "Test/MockViewFactory"
], function (
    GadgetSpace,
    GadgetArea,
    Gadget,
    GadgetFactory,
    MockViewFactory
) {
    var b;

    /**
     * Test the primitive request methods.
     */
    b = new TestCase("TestGadgetSpace", {

        setUp: function () {
            this.gadgetSpace = new GadgetSpace({
                viewFactory: new MockViewFactory(),
                gadgetFactory: new GadgetFactory({
                    resolver: function (name) {
                        return Gadget;
                    }
                }),
                extendedWindowConfig: {
                    url: ""
                }
            });
        },

        // Test simple create.
        testSimpleGadgetLoading: function () {
            var testArea;
            assertNotUndefined(this.gadgetSpace);
            this.gadgetSpace.addGadget("gadget", {});
            this.gadgetSpace.loadGadgetTo("gadget", "windows[0]/center", true);
            testArea = this.gadgetSpace.getArea("windows[0]");
            assertNotUndefined(testArea);
        }
    });

});