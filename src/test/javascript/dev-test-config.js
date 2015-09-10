(function () {

    var tryLoad = false;
    var tests = [];
    for (var file in window.__karma__.files) {
        if (window.__karma__.files.hasOwnProperty(file)) {
            if (/Test\w+\.js$/.test(file)) {
                tests.push(file);
            }
        }
    }

    require.config({
        baseUrl: "/base/src",
        paths: {
            smithy: "main",
            external: "test/javascript/third-party",
            Test: "test/javascript",
            data: "test/data"
        },

        deps: tests,

        // start test run, once Require.js is done
        // callback: window.__karma__.start
        callback: function() {
            // function retry() {
            //     if (!tryLoad) {
            //         setTimeout(retry, 10);
            //     } else {
            //         window.__karma__.start();
            //     }
            // }
            // retry();

            setTimeout(window.__karma__.start, 5000);
        }
    });
}());
