/**
 * User: kevin.convy
 * Date: 9/19/12
 * Time: 3:42 PM
 */
var requirejs = require("requirejs");
requirejs.config({
    nodeRequire: require,
    baseUrl: "src/main/javascript/smithy-js",
    paths: {
        "ORE": "../../../../target/test-source/lib/ore-js",
        "dojo": "../../../../target/test-source/lib/dojo-1.8.0/dojo",
        "dojox": "../../../../target/test-source/lib/dojo-1.8.0/dojox"
    }
});

requirejs(["GadgetSpace"], function (GadgetSpace) {
    var a1, tmp = new GadgetSpace({});
    a1 = tmp.addArea("row[0]");
});

