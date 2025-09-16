import { src, dest, series, watch } from 'gulp';
import gulpSass from 'gulp-sass';
import browserSync from 'browser-sync';
import { deleteAsync } from 'del';
import fileInclude from 'gulp-file-include';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import pretty from 'gulp-prettier';
import * as dartSass from 'sass';
import csso from 'gulp-csso';
import imagemin from 'gulp-imagemin';
import imageminOptipng from 'imagemin-optipng';
import imageminSvgo from 'imagemin-svgo';

const sass = gulpSass(dartSass);

const isDev = process.env.NODE_ENV === 'development';

async function htmlCopy() {
  return src('./src/**/*.html').pipe(dest('./dist'));
}

function htmlTask() {
  let stream = src('./src/**/*.html').pipe(fileInclude());

  if (!isDev) {
    stream = stream.pipe(
      htmlmin({ collapseWhitespace: true })
    );
  }
  return stream.pipe(dest('./dist/'));
}

function scss() {
  const stream = src('./src/**/*.scss').pipe(
    sass().on('error', sass.logError)
  );

  if (!isDev) {
    stream.pipe(csso());
  }

  return stream
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./dist'))
    .pipe(browserSync.stream());
}

function copyImages() {
  return src(
    ['./src/assets/**/*.{png,jpg,jpeg,gif,webp,svg}'],
    {
      encoding: false
    }
  ).pipe(dest('./dist/assets'));
}

function optimizeImages() {
  return src('./src/assets/**/*.{png, svg}', {
    encoding: false
  })
    .pipe(
      imagemin(
        imagemin([imageminOptipng(), imageminSvgo()], {
          verbose: true
        })
      )
    )
    .pipe(dest('./dist/assets/'));
}

function copyFonts() {
  return src(
    './src/assets/fonts/**/*.{ttf,woff,woff2}'
  ).pipe(dest('dist/assets/fonts'));
}

function favicon() {
  let stream = src('./public/favicon.svg');

  if (!isDev) {
    stream = stream.pipe(imagemin());
  }

  return stream.pipe(dest('./dist'));
}

function formatFiles() {
  return src([
    './src/**/*.{css,html}',
    '!./node_modules/**/*'
  ])
    .pipe(pretty())
    .pipe(dest('./src'));
}

async function cleanDist() {
  await deleteAsync(['./dist/*']);
}

function serve(done) {
  browserSync.init({
    server: './dist',
    notify: false
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

export const build = series(
  cleanDist,
  favicon,
  copyImages,
  copyFonts,
  htmlCopy,
  htmlTask,
  scss,
  formatFiles
);

export const prod = series(
  cleanDist,
  favicon,
  optimizeImages,
  copyFonts,
  htmlTask,
  scss
);

export const dev = series(build, serve, watcher);

export default series(build, serve);
