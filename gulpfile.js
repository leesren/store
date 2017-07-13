// yarn add gulp gulp-load-plugins gulp-connect gulp-uglify gulp-rev-append run-sequence gulp-postcss gulp-sass autoprefixer

let gulp = require('gulp')
plugins = require('gulp-load-plugins')()
connect = require('gulp-connect')

var uglify = require('gulp-uglify');
plugins.revAppend = require('gulp-rev-append');// 查找并给指定链接填加版本号（默认根据文件MD5生成，因此文件未发生改变，此版本号将不会变
let runSequence = require('run-sequence');// 队列化任务
let path = require('path');
let postcss = require('gulp-postcss');
let sass = require('gulp-sass');
let autoprefixer = require('autoprefixer');
let concat = require('gulp-concat');
let rename = require('gulp-rename');
let cssnano = require('gulp-cssnano');
var del = require('del');
var proxyMiddleware = require('http-proxy-middleware');
var babel = require('gulp-babel');
var rollup = require('gulp-rollup');
var size = require('gulp-size');
var sourcemaps = require('gulp-sourcemaps');

let PROT = 4000;
gulp.task('serve', () => {
    connect.server({
        root: [__dirname],
        port: PROT,
        livereload: true,

        middleware: function (connect, opt) {
            return [proxyMiddleware('/api', {
                // target: 'http://120.24.74.199:9001/eher',
                target: 'http://192.168.10.236:8080/eher.managerment.store',
                changeOrigin: true
            })];
        }
    })
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
gulp.task('clean', function () {
    return del(['tmp'], { dot: true })
})
gulp.task('css2', ['clean'], function () {
    var postcss_plugins = [
        autoprefixer({ browsers: ['> 0.1%'], cascade: false })
    ];
    return gulp.src(['./src/css/index.css'])
        .pipe(concat('mymain.css'))
        .pipe(cssnano())
        .pipe(postcss(postcss_plugins))
        .pipe(gulp.dest('./tmp'));
});
gulp.task('scss', function () {
    var postcss_plugins = [
        autoprefixer({ browsers: ['> 0.1%'], cascade: false })
    ];
    return gulp.src('./src/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        // .pipe(concat('sass-all.min.css'))
        .pipe(cssnano())
        .pipe(postcss(postcss_plugins))
        .pipe(gulp.dest(config.css.srcDir))
});
gulp.task('js', () => {
    gulp.src(config.js.src)
        //.pipe(plugins.uglify())
        .pipe(gulp.dest(config.js.dest))
});
gulp.task('concat', () => {
    var dir = './src/js';
    gulp.src([dir + '/request.js', dir + '/util.js', dir + '/customer_module.js', dir + '/mixins.js'])
        .pipe(concat('concat.base.js'))
        .pipe(gulp.dest(dir))
});

gulp.task("revreplace", function () {
    return gulp.src('./src/*.html')
        .pipe(plugins.revAppend())
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts', () =>
    gulp.src([
        // Note: Since we are not using useref in the scripts build pipeline,
        //       you need to explicitly list your scripts here in the right order
        //       to be correctly concatenated
        './src/es6/*.js'
        // Other scripts
    ])
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(rollup({
            // any option supported by Rollup can be set here.
            "format": "iife",
            "plugins": [
                require("rollup-plugin-babel")({
                    "presets": [["es2015", { "modules": false }]],
                    "plugins": ["external-helpers"]
                })
            ],
            entry: './src/es6/index.js'
        }))
        //   .pipe($.newer('.tmp/scripts'))
        //   .pipe($.sourcemaps.init())
        //   .pipe(babel())
        //   .pipe($.sourcemaps.write())
        //   .pipe(gulp.dest('.tmp/scripts'))
        //   .pipe(concat('main.min.js'))
        //   .pipe($.uglify({preserveComments: 'some'}))
        // Output files
        //   .pipe($.size({title: 'scripts'}))
        //   .pipe($.sourcemaps.write('.'))
        //   .pipe(gulp.dest('dist/scripts'))
        .pipe(rename('main.min.js'))
        // .pipe(uglify({ preserveComments: 'some' }))
        .pipe(size({ title: 'scripts' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./src/js'))
);

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
        runSequence(['js', 'concat'], ['revreplace']);
    });

    gulp.watch([config.scss.src], function (file) {// js处理
        // let extname = path.extname(file.path);
        runSequence(['scss'], function () {
            runSequence('css', 'revreplace');
        });
    });


    gulp.watch(config.html.src, function () {// html处理
        runSequence(['revreplace']);
    });
});
