const gulp = require('gulp');
const sass = require('gulp-sass');
const shell = require('gulp-shell');
const sourcemaps = require('gulp-sourcemaps');



gulp.task('mongo', shell.task([
    'mongod --dbpath %cd%\\db\\MongoDB\\data'
]));
gulp.task('server', shell.task([
    'node server.js'
]));


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