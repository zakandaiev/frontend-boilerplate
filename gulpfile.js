'use strict';

const browserSync 	= require('browser-sync').create();

const del 			= require('del');

const gulp 			= require('gulp'),
	autoprefixer 	= require('gulp-autoprefixer'),
	cleancss 		= require('gulp-clean-css'),
	htmlmin 		= require('gulp-htmlmin'),
	imagemin 		= require('gulp-imagemin'),
	rigger 			= require('gulp-rigger'),
	sourcemaps 		= require('gulp-sourcemaps'),
	stylus 			= require('gulp-stylus'),
	uglify 			= require('gulp-uglify');

const path = {
	prod_build: {
		html: '_production-build/',
		js: '_production-build/js/',
		css: '_production-build/css/',
		img: '_production-build/img/'
	},
	dev_build: {
		html: 'dist/',
		js: 'dist/js/',
		css: 'dist/css/',
		img: 'dist/img/'
	},
	src: {
		html: 'src/*.html',
		js: 'src/js/main.js',
		style: 'src/styles/main.styl',
		img: 'src/img/**/*.*'
	},
	watch: {
		html: 'src/**/*.html',
		js: 'src/js/**/*.js',
		style: 'src/styles/**/*.styl',
		img: 'src/img/**/*.*'
	},
	clean: {
		dev_folder: './dist/*',
		prod_folder: './_production-build/*'
	}
};

function cleanDev() {
	return del([path.clean.dev_folder]);
}

function cleanProd() {
	return del([path.clean.prod_folder]);
}

function htmlDevBuild() {
	return 	gulp.src(path.src.html)
			.pipe(rigger())
			.pipe(gulp.dest(path.dev_build.html))
			.pipe(browserSync.stream());
}

function htmlProdBuild() {
	return 	gulp.src(path.src.html)
			.pipe(rigger())
			.pipe(htmlmin({
				collapseWhitespace: true,
				minifyCSS: true,
				minifyJS: true,
				removeComments: true
			}))
			.pipe(gulp.dest(path.prod_build.html));
}

function cssDevBuild() {
	return 	gulp.src(path.src.style)
			.pipe(sourcemaps.init())
			.pipe(stylus({
				'include css': true,
				compress: false,
				linenos: false,
				sourceMap: true,
				errLogToConsole: true
			}))
			.pipe(autoprefixer(['last 15 versions']))
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(path.dev_build.css))
			.pipe(browserSync.stream());
}

function cssProdBuild() {
	return 	gulp.src(path.src.style)
			.pipe(stylus({
				'include css': true,
				compress: true,
				linenos: false,
				sourceMap: false,
				errLogToConsole: true
			}))
			.pipe(autoprefixer(['last 15 versions']))
			.pipe(cleancss( {level: 1} ))
			.pipe(gulp.dest(path.prod_build.css));
}

function jsDevBuild() {
	return 	gulp.src(path.src.js)
			.pipe(rigger())
			.pipe(sourcemaps.init())
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(path.dev_build.js))
			.pipe(browserSync.stream());
}

function jsProdBuild() {
	return 	gulp.src(path.src.js)
			.pipe(rigger())
			.pipe(uglify())
			.pipe(gulp.dest(path.prod_build.js));
}

function imageDevBuild() {
	return 	gulp.src(path.src.img)
			.pipe(gulp.dest(path.dev_build.img))
			.pipe(browserSync.stream());
}

function imageProdBuild() {
	return 	gulp.src(path.src.img)
			.pipe(imagemin([
				imagemin.gifsicle({interlaced: true}),
				imagemin.jpegtran({progressive: true}),
				imagemin.optipng({optimizationLevel: 5})
			], {
				verbose: true
			}))
			.pipe(gulp.dest(path.prod_build.img));
}

function rootDirFilesBuild() {
	return 	gulp.src('./src/_root-dir-files/**/*.*')
			.pipe(gulp.dest(path.dev_build.html))
			.pipe(gulp.dest(path.prod_build.html))
			.pipe(browserSync.stream());
}

function watch() {
	browserSync.init({
		server: {
			baseDir: "./dist"
		},
		//tunnel: true,
		notify: false,
		open: true
	});
	
	gulp.watch([path.watch.html], htmlDevBuild);
	gulp.watch([path.watch.style], cssDevBuild);
	gulp.watch([path.watch.js], jsDevBuild);
	gulp.watch([path.watch.img], imageDevBuild);
	gulp.watch(['./src/_root-dir-files/**/*.*'], rootDirFilesBuild);
}

// *** EXPORT TASKS *** \\
// del
exports.cleanDev = cleanDev;
exports.cleanProd = cleanProd;

// html
exports.htmlDevBuild = htmlDevBuild;
exports.htmlProdBuild = htmlProdBuild;

// css
exports.cssDevBuild = cssDevBuild;
exports.cssProdBuild = cssProdBuild;

// js
exports.jsDevBuild = jsDevBuild;
exports.jsProdBuild = jsProdBuild;

// image
exports.imageDevBuild = imageDevBuild;
exports.imageProdBuild = imageProdBuild;

// rootDirFiles
exports.rootDirFilesBuild = rootDirFilesBuild;

// browserSync watch
exports.watch = watch;

// *** DEVELOPEMENT BUILD *** \\
async function startDevBuild() {
	return gulp.series (
					cleanDev,
					gulp.parallel (
						htmlDevBuild,
						cssDevBuild,
						jsDevBuild,
						imageDevBuild,
						rootDirFilesBuild
					),
					watch
	)();
}
exports.start = startDevBuild;

// *** PRODUCTION BUILD *** \\
async function makeProdBuild() {
	return gulp.series (
					cleanProd,
					gulp.parallel (
						htmlProdBuild,
						cssProdBuild,
						jsProdBuild,
						imageProdBuild,
						rootDirFilesBuild
					)
	)();
}
exports.build = makeProdBuild;

// *** DEFAULT GULP TASK *** \\
exports.default = startDevBuild;