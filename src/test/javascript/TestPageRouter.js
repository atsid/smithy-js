/**
 * Test the page router. Has to be minimal because page reloading in the middle of a test isn't supported by
 * jsTestDriver.
 */
require([
    "smithy/PageRouter"
], function (
    PageRouter
) {
    var b;

    /**
     * Test n
     */
    b = new TestCase("TestPageRouter", {

        setUp: function () {
            this.router = new PageRouter({
                mode: "url",
                rootPattern: /slave/
            });
        },

        // Test registering a pattern with the router.
        testRegisterDefault: function () {
            var called,
                callback = function (location) {
                    called = location;
                },
                oldOnload = window.onload,
                rouerOnload;
            this.router.register(new RegExp(window.location.pathname.replace(/slave/, "")), callback);
            this.router.startup();
            // call the onload by hand since we can't reload the page.
            routerOnload = window.onload;
            routerOnload();
            window.onload = oldOnload;
            assertNotUndefined(called);
            assertEquals(called.pathname, window.location.pathname.replace(/slave/, ""));
        },

        // test is default
        testIsDefault: function () {
            assertFalse(this.router.isDefault());
        }

    });

});