// yarn add gulp gulp-load-plugins gulp-connect gulp-uglify gulp-rev-append run-sequence gulp-postcss gulp-sass autoprefixer

let gulp = require('gulp')
plugins = require('gulp-load-plugins')()
connect = require('gulp-connect')

plugins.uglify = require('gulp-uglify')
plugins.revAppend = require('gulp-rev-append');// 查找并给指定链接填加版本号（默认根据文件MD5生成，因此文件未发生改变，此版本号将不会变
let runSequence = require('run-sequence');// 队列化任务
let path = require('path');
let postcss = require('gulp-postcss');
let sass = require('gulp-sass');
let autoprefixer = require('autoprefixer');
let PROT = 4000;
gulp.task('serve', () => {
    connect.server({
        root: [__dirname],
        port: PROT,
        livereload: true
    });
});

let config = {
    css: {
        src: 'src/css/*.css',
        dest: './dist/assets/css',
        srcDir: 'src/css'
    },
    scss: {
        src: 'src/scss/*.scss',
        dest: './dist/assets/css'
    },
    js: {
        src: 'src/js/*.js',
        dest: './dist/assets/js'
    },
    html: {
        src: './src/*.html',
        dest: './dist'
    },
    reload: {
        dist: './dist/**/*',
        reloadFile: './dist'
    }
}

gulp.task('css', function () {
    return gulp.src(config.css.src)
        .pipe(gulp.dest(config.css.dest));
});
gulp.task('scss', function () {
    var postcss_plugins = [
        autoprefixer({ browsers: ['> 0.1%'], cascade: false })
    ];
    return gulp.src(config.scss.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postcss_plugins))
        .pipe(gulp.dest(config.css.srcDir));
});
gulp.task('js', () => {
    gulp.src(config.js.src)
        //.pipe(plugins.uglify())
        .pipe(gulp.dest(config.js.dest))
});

gulp.task("revreplace", function () {
    return gulp.src('./src/*.html')
        .pipe(plugins.revAppend())
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['serve'], () => {
    // 自动刷新
    gulp.watch(config.reload.dist).on('change', function (file) {
        gulp.src(config.reload.reloadFile)
            .pipe(connect.reload());
    });
	gulp.watch('./src/*.html').on('change', function (file) {
        gulp.src('./src/*.html')
            .pipe(connect.reload());
    });
    gulp.watch([config.js.src], function (file) {// js处理
        runSequence(['js'], ['revreplace']);
    });
     
    gulp.watch([config.scss.src], function (file) {// js处理
        // let extname = path.extname(file.path);
       runSequence(['scss'],function(){
           runSequence('css','revreplace');
       });
    });
 

    gulp.watch(config.html.src, function () {// html处理
        runSequence(['revreplace']);
    });
});
