/**
 * Test the page routing gadget space.
 */
require([
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
    var b;

    /**
     * Test the primitive request methods.
     */
    b = new TestCase("TestPageRoutingGadgetSpace", {

        setUp: function () {
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
            this.gadgetSpace = new GadgetSpace({
                viewFactory: new MockViewFactory(),
                usePageRouting: "url",
                gadgetFactory: new GadgetFactory({
                    resolver: function (name) {
                        return Gadget;
                    }
                }),
                routingSpecification: routingSpec
            });
        },

        // Test simple create.
        testRoutingSpec: function () {
        }
    });

});