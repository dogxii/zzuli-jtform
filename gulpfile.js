const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const cssnano = require('gulp-cssnano');
const terser = require('gulp-terser');
const rename = require('gulp-rename');

// 压缩 HTML
gulp.task('minify-html', () => {
  return gulp.src(['*.html']) // 匹配所有 HTML 文件
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true
    }))
    // .pipe(rename({ suffix: '.min' })) // 添加 .min 后缀
    .pipe(gulp.dest('public')); // 输出到 public 文件夹
});

// 压缩 CSS
gulp.task('minify-css', () => {
  return gulp.src('src/**/*.css') // 匹配 src 文件夹下的所有 CSS 文件
    .pipe(cssnano())
    // .pipe(rename({ suffix: '.min' })) // 添加 .min 后缀
    .pipe(gulp.dest('public/src')); // 输出到 public/src 文件夹
});

// 压缩 JS
gulp.task('minify-js', () => {
  return gulp.src('src/**/*.js') // 匹配 src 文件夹下的所有 JS 文件
    .pipe(terser())
    // .pipe(rename({ suffix: '.min' })) // 添加 .min 后缀
    .pipe(gulp.dest('public/src')); // 输出到 public/src 文件夹
});

// 默认任务：同时压缩 HTML、CSS 和 JS
gulp.task('default', gulp.parallel('minify-html', 'minify-css', 'minify-js'));
