/**
 * Created with JetBrains WebStorm.
 * User: kevin.convy
 * Date: 1/28/13
 * Time: 3:20 PM
 * Build profile for RequireJs' optimizer.
 */
({
    baseUrl: "./src/main",
    paths: {
        smithy: ".",
        dojo: "empty:",
        dojox: "empty:",
        dijit: "empty:"
    },
    name: "smithy/fullpack",
    out: "src/main/smithy-0.1.3-min.js"
})
