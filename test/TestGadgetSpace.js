define([
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
    /**
     * Test the primitive request methods.
     */
    describe("TestGadgetSpace", function() {

        var gadgetSpace;
        beforeEach(function () {
            gadgetSpace = new GadgetSpace({
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
        });

        // Test simple create.
        it("testSimpleGadgetLoading", function () {
            var testArea;
            expect(gadgetSpace).not.toBeUndefined();
            gadgetSpace.addGadget("gadget", {});
            gadgetSpace.loadGadgetTo("gadget", "windows[0]/center", true);
            testArea = gadgetSpace.getArea("windows[0]");
            expect(testArea).not.toBeUndefined();
        });
    });

});