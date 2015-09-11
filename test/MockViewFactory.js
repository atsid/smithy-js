define([
    "smithy/declare"
], function (
    declare
) {

    /**
     * @class MockViewFactory
     */
    return declare(null, {

        createView: function (area, mode) {
            var v = {
                addChild: function (view, region) {},

                removeChild: function (childView) {},

                startup: function () {}
            };
            return v;
        }

    });

});


