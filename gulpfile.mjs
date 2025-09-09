import { src, dest, series, watch } from "gulp";
import gulpSass from "gulp-sass";
import browserSync from "browser-sync";
import * as dart from "sass";
import { deleteAsync } from "del";
import fileInclude from "gulp-file-include";

async function htmlCopy() {
	return src("./src/**/*.html").pipe(dest("./dist"));
}

function htmlTask() {
	return src("./src/**/*.html")
		.pipe(fileInclude())
		.pipe(dest("./dist/"));
}

const sass = gulpSass(dart);
function scss() {
	return src("./src/**/*.scss")
		.pipe(sass().on("error", sass.logError))
		.pipe(dest("./dist"))
		.pipe(browserSync.stream());
}

function favicon() {
	return src("./public/favicon.svg").pipe(dest("./dist"));
}

async function cleanDist() {
	await deleteAsync(["./dist/*"]);
}

function serve(done) {
	browserSync.init({
		server: "./dist",
		notify: false,
	});

	done();
}

function reload(done) {
	browserSync.reload();
	done();
}

function watcher() {
	watch("./src/**/*.html", htmlCopy);
	watch("./src/**/*.scss", scss);
	watch("./dist/**/*", reload);
}

const build = series(cleanDist, favicon, htmlCopy, htmlTask, scss);
export default series(build, serve, watcher);
