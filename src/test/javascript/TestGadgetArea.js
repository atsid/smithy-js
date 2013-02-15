require([
    "smithy/GadgetArea"
], function (
    GadgetArea
) {
    var b;

    /**
     */
    b = new TestCase("TestGadgetArea", {

        setUp: function () {
            this.gadgetArea = new GadgetArea({layoutMode: "rows"});
            this.mockViewFactory = {
                createView: function () { return {}; }
            };
        },

        // Test simple create.
        testAddAreaWithCreateIntermediate: function () {
            var a1, a2, a3, a4, rows;
            assertNotUndefined(this.gadgetArea);
            a4 = this.gadgetArea.addArea("rows[0]/columns[0]/tabs[0]/left", true);
            assertEquals("/rows[0]/columns[0]/tabs[0]/left", a4.getAddress());
            assertNotUndefined(a4);
            a1 = this.gadgetArea.getArea("rows[0]");
            assertNotUndefined(a1);
            a2 = this.gadgetArea.getArea("rows[0]/columns[0]");
            assertNotUndefined(a2);
            a3 = this.gadgetArea.getArea("rows[0]/columns[0]/tabs[0]");
            assertNotUndefined(a3);
        }
    });

});