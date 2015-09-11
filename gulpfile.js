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
    return gulp.src("js/fullpack.js")
        .pipe(require('gulp-requirejs-optimize')({
            baseUrl: "./js",
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


// Versioning tasks
/**
 * Increments a version value within the package json and bower json
 */
function inc(importance) {
    var git = require('gulp-git'),
        bump = require('gulp-bump'),
        filter = require('gulp-filter'),
        tag_version = require('gulp-tag-version');

    // get all the files to bump version in
    return gulp.src(['./package.json', './bower.json'])
        // bump the version number in those files
        .pipe(bump({type: importance}))
        // save it back to filesystem
        .pipe(gulp.dest('./'))
        // commit the changed version number
        .pipe(git.commit('bumps package version'))

        // read only one file to get the version number
        .pipe(filter('package.json'))
        // **tag it in the repository**
        .pipe(tag_version());
}

gulp.task('patch', function() { return inc('patch'); })
gulp.task('feature', function() { return inc('minor'); })
gulp.task('release', function() { return inc('major'); })