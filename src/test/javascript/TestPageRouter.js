/**
 * Test the page router. Has to be minimal because page reloading in the middle of a test isn't supported by
 * jsTestDriver.
 */
require([
    "smithy/PageRouter"
], function (
    PageRouter
) {
    /**
     * Test n
     */
    describe("TestPageRouter", function() {

        var router;
        beforeEach(function () {
            router = new PageRouter({
                mode: "url",
                rootPattern: /slave/
            });
        });

        // Test registering a pattern with the router.
        it("testRegisterDefault", function () {
            var called = 0,
                callback = function (location) {
                    called += 1;
                },
                oldOnload = window.onload,
                rouerOnload;
            router.register(new RegExp(window.location.pathname.replace(/slave/, "")), callback);
            router.register(/.*/ , callback);
            router.startup();
            // call the onload by hand since we can't reload the page.
            routerOnload = window.onload;
            routerOnload();
            window.onload = oldOnload;
            expect(called).not.toBeUndefined();
            expect(1).toEqual(called);
        });

        // test is default
        it("testIsDefault", function () {
            expect(router.isDefault()).toBe(false);
        });

    });

});