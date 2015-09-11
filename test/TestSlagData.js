define([
    "smithy/Slag",
    "smithy/WebStorage"
], function (
    SlagData,
    WebStorage
) {
    /**
     * Test operations on slag data
     */
    describe("TestSlagData", function() {

        beforeEach(function () {
            this.webstorage = new WebStorage({namespace: "SmithySlag"});
            this.webstorage.clearLocal();
            this.webstorage.clearSession();
        });

        // Test global configuration of slag data.
        it("testUseOfWebStorage", function () {
            var slagLocal = new SlagData({useWebStorage: "local"}),
                slagSession = new SlagData({useWebStorage: "session"}),
                slagObject = new SlagData({useWebStorage: false});

            slagLocal.set("tst/data", "testdata");
            expect("testdata").toEqual(this.webstorage.getLocalObject("tst/data"));
            expect("testdata").not.toEqual(this.webstorage.getSessionObject("tst/data"));
            expect(slagLocal.data && slagLocal.data["tst/data"]).toBeUndefined();
            slagLocal.set("tst/data", "");

            slagSession.set("tst/data", "testdata");
            expect("testdata").not.toEqual(this.webstorage.getLocalObject("tst/data"));
            expect("testdata").toEqual(this.webstorage.getSessionObject("tst/data"));
            expect(slagSession.data && slagSession.data["tst/data"]).toBeUndefined();
            slagSession.set("tst/data", "");

            slagObject.set("tst/data", "testdata");
            expect("testdata").not.toEqual(this.webstorage.getLocalObject("tst/data"));
            expect("testdata").not.toEqual(this.webstorage.getSessionObject("tst/data"));
            expect("testdata").toEqual(slagObject.data["tst/data"]);
            slagObject.set("tst/data", "");
        });

        // Test method override of storage setting.
        it("testSetMethodOverrideOfWebStorage", function () {
            var slagLocal = new SlagData({useWebStorage: "local"});

            slagLocal.set("tst/data", "testdata");
            expect("testdata").toEqual(this.webstorage.getLocalObject("tst/data"));
            expect("testdata").not.toEqual(this.webstorage.getSessionObject("tst/data"));
            expect(slagLocal.data && slagLocal.data["tst/data"]).toBeUndefined();
            slagLocal.set("tst/data", "");

            slagLocal.set("tst/data", "testdata", {session:true});
            expect("testdata").not.toEqual(this.webstorage.getLocalObject("tst/data"));
            expect("testdata").toEqual(this.webstorage.getSessionObject("tst/data"));
            expect(slagLocal.data && slagLocal.data["tst/data"]).toBeUndefined();
            // should still be able to get it regardless of where it is.
            expect("testdata").toEqual(slagLocal.get("tst/data"));
        });
    });

});