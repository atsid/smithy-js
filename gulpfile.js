var gulp = require('gulp');

var paths = {
    scripts: ['js/**/*.js']
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
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('scripts', function () {
    var rename = require("gulp-rename");
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
        .pipe(rename("smithy.min.js"))
        .pipe(gulp.dest('./'));
});

gulp.task('build', function (callback) {
    require('run-sequence')('lint', 'test', 'scripts', callback);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['lint', 'test']);