(function () {
    require.config({
        baseUrl: "/test/src",
        paths: {
            smithy: "main",
            external: "test/javascript/third-party",
            Test: "test/javascript"
        }
    });
}());
