var gulp = require("gulp");
var rm = require("gulp-rm");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var closure = require("closure-compiler-stream");
var wrap = require("gulp-wrap");
var prettify = require('gulp-jsbeautifier');
var removeUseStrict = require("gulp-remove-use-strict");
var KarmaServer = require('karma').Server;

gulp.task("clean", function() {
  return gulp.src("dist/*")
    .pipe(rm());
});

gulp.task("build", ["clean"], function () {
  return gulp.src("src/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(concat("tardis-data.js"))
    .pipe(babel())
    .pipe(removeUseStrict())
    .pipe(wrap("(function() { <%= contents %> })();"))
    .pipe(prettify())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"))
});

var closureSettings = {
    compilation_level: "SIMPLE",
    angular_pass: null,
    js_output_file: "dist/tardis-data.min.js",
};

gulp.task("compress", ["build"], function(done) {
	return gulp.src("dist/tardis-data.js")
        .pipe(closure(closureSettings))
        .pipe(gulp.dest("dist"));
});

gulp.task("test", ["build"], function(done) {
    new KarmaServer({
        configFile: __dirname + "/karma.conf.js",
        singleRun: true
    }, done).start();
});

gulp.task("default", ["build", "compress", "test"]);
