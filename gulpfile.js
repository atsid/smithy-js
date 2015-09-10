var gulp = require('gulp');

var paths = {
    scripts: ['src/main/**/*.js']
};

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
    new (require('karma').Server)({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('lint', function () {
    var jshint = require('gulp-jshint');
    return gulp.src(paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', function () {
    return gulp.src("src/main/fullpack.js")
        .pipe(require('gulp-requirejs-optimize')({
            baseUrl: "./src/main",
            paths: {
                smithy: ".",
                dojo: "empty:",
                dojox: "empty:",
                dijit: "empty:"
            },
            name: "smithy/fullpack"
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['lint', 'test', 'scripts']);

// The default task (called when you run `gulp` from cli)
// gulp.task('default', ['watch', 'scripts', 'images']);