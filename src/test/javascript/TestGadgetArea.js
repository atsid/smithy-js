
require([
    "smithy/GadgetArea"
], function (
    GadgetArea
) {
    describe("TestGadgetArea", function () {
        var gadgetArea;
        var mockViewFactory;
        beforeEach(function () {
            gadgetArea = new GadgetArea({ layoutMode: "rows" });
            mockViewFactory = {
                createView: function () { return {}; }
            };
        });
        it("testAddAreaWithCreateIntermediate", function() {
            var a1, a2, a3, a4;
            expect(gadgetArea).not.toBeUndefined();
            a4 = gadgetArea.addArea("rows[0]/columns[0]/tabs[0]/left", true);
            expect("/rows[0]/columns[0]/tabs[0]/left").toBe(a4.getAddress());
            expect(a4).not.toBeUndefined();
            a1 = gadgetArea.getArea("rows[0]");
            expect(a1).not.toBeUndefined();
            a2 = gadgetArea.getArea("rows[0]/columns[0]");
            expect(a2).not.toBeUndefined();
            a3 = gadgetArea.getArea("rows[0]/columns[0]/tabs[0]");
            expect(a3).not.toBeUndefined();
        });
    });
});