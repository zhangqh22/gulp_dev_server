const gulp = require('gulp');

const browserSync = require('browser-sync'); // 同步浏览器
const clean = require('gulp-clean'); // 请理文件

// css相关
const less = require('gulp-less'); // less
const LessAutoprefix = require('less-plugin-autoprefix'); // less自动前缀
const autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });
const cleanCSS = require('gulp-clean-css'); // css压缩
const spriter = require('gulp-css-spriter'); // css图片合成

// img相关
const imagemin = require('gulp-imagemin'); // 图片压缩

// js相关
const babel = require('gulp-babel');
const uglify = require('gulp-uglify'); // js压缩
const chinese2unicode = require('gulp-chinese2unicode'); // 中文转unicode

// html相关
const htmlmin = require('gulp-htmlmin'); // html压缩
const removeEmptyLines = require('gulp-remove-empty-lines'); // 清除空白行
const replace = require('gulp-replace'); // 替换文件名

// 删除目录
gulp.task('clean', async function() {
    await gulp.src('./build', {read: false, allowEmpty: true}).pipe(clean({force: true}));
});

// css任务
gulp.task('css', async function() {
	await gulp.src('./src/less/*.less')
	.pipe(less({
	    plugins: [autoprefix]
	}))
    .pipe(cleanCSS())
	.pipe(gulp.dest('./build/css'));
});

// img任务
gulp.task('img',  async function() {
    await gulp.src('./src/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./build/images'));
});

// js任务
gulp.task('js', async function() {
    await gulp.src('./src/js/*.js')
    .pipe(babel({
        presets: ['@babel/preset-env']
    }))
    .pipe(uglify({mangle: true, compress: false}))
    .pipe(chinese2unicode())
    .on('error', function (err) {
       console.log(err.toString());
    })
    .pipe(gulp.dest('./build/js'))
});

// html任务
gulp.task('html', async function() {
    const options = {
        removeComments: true,                           // 清除HTML注释
        collapseWhitespace: false,                      // 压缩HTML
        collapseBooleanAttributes: true,                // 省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,                    // 删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,               // 删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,            // 删除<style>和<link>的type="text/css"
        minifyJS: true,                                 // 压缩页面JS
        minifyCSS: true                                 // 压缩页面CSS
    };
    await gulp.src('./src/index.html')
    .pipe(replace(/less\/(\w+)\.less/g, 'css/$1.css'))  // 替换名称
    .pipe(removeEmptyLines({removeComments: true}))     // 删除空白行
    .pipe(htmlmin(options))                             // 压缩
    .pipe(gulp.dest('./build'));
});

// 默认任务(build) gulp.series串行  gulp.parallel并行
gulp.task('default', gulp.series('clean', gulp.parallel('css', 'img', 'js', 'html'), function(callback) {
    callback();
}));

// 开发任务(dev)
gulp.task('dev', function() {
    // 启动build/index.html 
    // browsersync配置：http://www.browsersync.cn/docs/options/
    browserSync({
        server: './build',
        port: 3003 // 端口号
    });
    gulp.watch('./src/less/*.less', gulp.series('css', function(callback) { 
        browserSync.reload();
        callback(); 
    }));
    gulp.watch('./src/js/*.js', gulp.series('js', function(callback) { 
        browserSync.reload();
        callback(); 
    }));
    gulp.watch('./src/images/*', gulp.series('img', function(callback) { 
        browserSync.reload();
        callback(); 
    }));
    gulp.watch('./src/index.html', gulp.series('html', function(callback) { 
        browserSync.reload();
        callback(); 
    }));
});