// Deprecated but left here for now; use the gulp tasks in the Gruntfile.
var gulp = require('gulp');
var concat = require('gulp-concat');
var terser = require('gulp-terser');
var insert = require('gulp-insert');

gulp.task( 'dev', function() {
	return gulp
	.src([
		'./buildScripts/ns.js',
		'./src/js/utils/utils.js',
		'./src/js/utils/EventEmitter.js',
		'./src/js/utils/DragListener.js',
		'./src/js/**'
	])
	.pipe(concat('goldenlayout.js'))
	.pipe(insert.wrap('(function($){', `})(window.$);
	exports = window.GoldenLayout;` ))
	.pipe(gulp.dest('./dist'));
});

gulp.task( 'build', function() {
	return gulp
	.src([
		'./buildScripts/ns.js',
		'./src/js/utils/utils.js',
		'./src/js/utils/EventEmitter.js',
		'./src/js/utils/DragListener.js',
		'./src/js/**'
	])
	.pipe(concat('goldenlayout.js'))
	.pipe(insert.wrap('(function($){', `})(window.$);
	exports = window.GoldenLayout;` ))
	.pipe(gulp.dest('./dist'))
	.pipe(terser())
	.pipe(concat('goldenlayout.min.js'))
	.pipe(gulp.dest('./dist'));
});
