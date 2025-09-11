import { src, dest, series, watch } from 'gulp';
import gulpSass from 'gulp-sass';
import browserSync from 'browser-sync';
import { deleteAsync } from 'del';
import fileInclude from 'gulp-file-include';
import pretty from 'gulp-prettier';
import * as dartSass from 'sass';

const sass = gulpSass(dartSass);

async function htmlCopy() {
  return src('./src/**/*.html').pipe(dest('./dist'));
}

function htmlTask() {
  return src('./src/**/*.html').pipe(fileInclude()).pipe(dest('./dist/'));
}

function scss() {
  return src('./src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./dist'))
    .pipe(browserSync.stream());
}

function formatFiles() {
  return src(['./src/**/*.{css,html}', '!./src/**/_*.{css,html}'])
    .pipe(pretty())
    .pipe(dest('./src'));
}

function copyImages() {
  return src(['./src/assets/**/*.{png,jpg,jpeg,gif,webp,svg}'], {
    encoding: false,
  }).pipe(dest('./dist/assets'));
}

function copyFonts() {
  return src('./src/assets/fonts/**/*.{ttf,woff,woff2}')
    .pipe(dest('dist/assets/fonts'));
}

function favicon() {
  return src('./public/favicon.svg').pipe(dest('./dist'));
}

async function cleanDist() {
  await deleteAsync(['./dist/*']);
}

function serve(done) {
  browserSync.init({
    server: './dist',
    notify: false,
  });

  done();
}

function reload(done) {
  browserSync.reload();
  done();
}

function watcher() {
  watch('./src/**/*.html', htmlCopy);
  watch('./src/**/*.html', htmlTask);
  watch('./src/**/*.scss', scss);
  watch('./dist/**/*', reload);
}

const build = series(
  cleanDist,
  favicon,
  copyImages,
  copyFonts,
  htmlCopy,
  htmlTask,
  scss,
  formatFiles,
);
export default series(build, serve, watcher);
