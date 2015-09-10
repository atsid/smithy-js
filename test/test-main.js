(function () {
    var tests = [];
    for (var file in window.__karma__.files) {
        if (window.__karma__.files.hasOwnProperty(file)) {
            if (/Test\w+\.js$/.test(file)) {
                tests.push(file);
            }
        }
    }

    require.config({
        baseUrl: "/base",
        paths: {
            smithy: "js",
            external: "test/third-party",
            Test: "test",
            data: "test/data"
        },

        deps: tests,

        // start test run, once Require.js is done
        // callback: window.__karma__.start
        callback: window.__karma__.start
    });
}());
