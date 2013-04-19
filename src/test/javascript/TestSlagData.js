require([
    "smithy/Slag",
    "smithy/WebStorage"
], function (
    SlagData,
    WebStorage
) {
    var b;

    /**
     * Test operations on slag data
     */
    b = new TestCase("TestSlagData", {

        setUp: function () {
            this.webstorage = new WebStorage({namespace: "SmithySlag"});
            this.webstorage.clearLocal();
            this.webstorage.clearSession();
        },

        // Test global configuration of slag data.
        testUseOfWebStorage: function () {
            var slagLocal = new SlagData({useWebStorage: "local"}),
                slagSession = new SlagData({useWebStorage: "session"}),
                slagObject = new SlagData({useWebStorage: false});

            slagLocal.set("tst/data", "testdata");
            assertEquals("testdata", this.webstorage.getLocalObject("tst/data"));
            assertNotEquals("testdata", this.webstorage.getSessionObject("tst/data"));
            assertUndefined(slagLocal.data && slagLocal.data["tst/data"]);
            slagLocal.set("tst/data", "");

            slagSession.set("tst/data", "testdata");
            assertNotEquals("testdata", this.webstorage.getLocalObject("tst/data"));
            assertEquals("testdata", this.webstorage.getSessionObject("tst/data"));
            assertUndefined(slagSession.data && slagSession.data["tst/data"]);
            slagSession.set("tst/data", "");

            slagObject.set("tst/data", "testdata");
            assertNotEquals("testdata", this.webstorage.getLocalObject("tst/data"));
            assertNotEquals("testdata", this.webstorage.getSessionObject("tst/data"));
            assertEquals("testdata", slagObject.data["tst/data"]);
            slagObject.set("tst/data", "");
        },

        // Test method override of storage setting.
        testSetMethodOverrideOfWebStorage: function () {
            var slagLocal = new SlagData({useWebStorage: "local"});

            slagLocal.set("tst/data", "testdata");
            assertEquals("testdata", this.webstorage.getLocalObject("tst/data"));
            assertNotEquals("testdata", this.webstorage.getSessionObject("tst/data"));
            assertUndefined(slagLocal.data && slagLocal.data["tst/data"]);
            slagLocal.set("tst/data", "");

            slagLocal.set("tst/data", "testdata", {session:true});
            assertNotEquals("testdata", this.webstorage.getLocalObject("tst/data"));
            assertEquals("testdata", this.webstorage.getSessionObject("tst/data"));
            assertUndefined(slagLocal.data && slagLocal.data["tst/data"]);
            // should still be able to get it regardless of where it is.
            assertEquals("testdata", slagLocal.get("tst/data"));
        }
    });

});