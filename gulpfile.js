var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function () {
    gulp.src('style/*.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            broswers: ['> 1%', 'ie 9', 'firefox > 18', 'safari 5', 'iso 6', 'android 3']
        }))
        .pipe(gulp.dest('style'));
});

gulp.task('default', ['sass'], function () {
    gulp.watch('style/*.scss', ['sass']);
});