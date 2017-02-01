const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('compile-sass', () => {
  return gulp.src('public/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/'));
});

gulp.task('sass-watch', () => {
  gulp.watch('public/**/*.scss', ['compile-sass']);
});