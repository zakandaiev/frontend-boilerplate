'use strict';

var browserSync 	= require('browser-sync').create();

var del 			= require('del');

var gulp 			= require('gulp'),
	autoprefixer 	= require('gulp-autoprefixer'),
	cleancss 		= require('gulp-clean-css'),
	htmlmin 		= require('gulp-htmlmin'),
	imagemin 		= require('gulp-imagemin'),
	rigger 			= require('gulp-rigger'),
	rsync 			= require('gulp-rsync'),
	sourcemaps 		= require('gulp-sourcemaps'),
	stylus 			= require('gulp-stylus'),
	uglify 			= require('gulp-uglify');

var path = {
    build: {
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
    clean: './dist/*'
};

function clean(){
	return del([path.clean]);
}
gulp.task('clean', clean);

function html_build(){
	return 	gulp.src(path.src.html)
			.pipe(rigger())
			.pipe(htmlmin({
				collapseWhitespace: true,
				minifyCSS: true,
				minifyJS: true,
				removeComments: true
			}))
			.pipe(gulp.dest(path.build.html))
			.pipe(browserSync.stream());
}
gulp.task('html:build', html_build);

function style_build(){
	return 	gulp.src(path.src.style)
			.pipe(sourcemaps.init())
			.pipe(stylus({
				'include css': true,
				compress: true,
				linenos: false,
				sourceMap: true,
				errLogToConsole: true
			}))
			.pipe(autoprefixer(['last 15 versions']))
			.pipe(cleancss( {level: 1} ))
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(path.build.css))
			.pipe(browserSync.stream());
}
gulp.task('style:build', style_build);

function js_build(){
	return 	gulp.src(path.src.js)
			.pipe(rigger())
			.pipe(sourcemaps.init())
			.pipe(uglify())
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(path.build.js))
			.pipe(browserSync.stream());
}
gulp.task('js:build', js_build);

function image_build(){
	return 	gulp.src(path.src.img)
			.pipe(imagemin({
				progressive: true,
				optimizationLevel: 5,
				svgoPlugins: [{removeViewBox: false}]
			}))
			.pipe(gulp.dest(path.build.img))
			.pipe(browserSync.stream());
}
gulp.task('image:build', image_build);

function rootDirFiles_build(){
	return 	gulp.src('./src/_root-dir-files/**/*.*')
			.pipe(gulp.dest('dist/'))
			.pipe(browserSync.stream());
}
gulp.task('rootdirfiles:build', rootDirFiles_build);

gulp.task('build', gulp.series	(clean, gulp.parallel (
											html_build,
											style_build,
											js_build,
											image_build,
											rootDirFiles_build
										)
								)
);

function watch(){
	browserSync.init({
        server: {
            baseDir: "./dist"
        },
		notify: false,
		open: true,
		//tunnel: true
    });
	
	gulp.watch([path.watch.html], html_build);
	gulp.watch([path.watch.style], style_build);
	gulp.watch([path.watch.js], js_build);
	gulp.watch([path.watch.img], image_build);
	gulp.watch(['./src/_root-dir-files/**/*.*'], rootDirFiles_build);
}
//gulp.task('watch', watch);

gulp.task('default', gulp.series('build', watch));

function rsync(){
	return gulp.src('dist/**')
	.pipe(rsync({
		root: 'dist/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		exclude: ['**/Thumbs.db', '**/*.DS_Store'],
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
}
gulp.task('deploy', rsync);