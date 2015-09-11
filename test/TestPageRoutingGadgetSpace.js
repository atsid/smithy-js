/**
 * Test the page routing gadget space.
 */
define([
    "smithy/PageRoutingGadgetSpace",
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
    describe("TestPageRoutingGadgetSpace", function() {

        beforeEach(function () {
            var routingSpec = {
                rootPattern: /slave/,
                routes: {
                    "default": {
                        id: "data/default",
                        url: ""
                    },
                    "error": {
                        id: "data/error"
                    },
                    "simple": {
                        id: "application/data/titlegadget",
                        url: "titlegadget/{applicationTitle}"
                    }
                }
            };
            var gadgetSpace = new GadgetSpace({
                viewFactory: new MockViewFactory(),
                usePageRouting: "url",
                gadgetFactory: new GadgetFactory({
                    resolver: function (name) {
                        return Gadget;
                    }
                }),
                routingSpecification: routingSpec
            });
        });

        // Test simple create.
        it("testRoutingSpec", function() {});
    });

});