const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('gulp-sass');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();

function sass2css(done) {
	src("./src/sass/app.scss")
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(dest("./dist/css/"))
		.pipe(browserSync.stream());

	done();
}

function doBrowserSync() {
	browserSync.init({
		server: {
			baseDir: "./dist"
		}
	});
}

function doNodemon(done) {
	const STARTUP_TIMEOUT = 5000;
	const server = nodemon({
		script: './bin/www',
    	stdout: false // without this line the stdout event won't fire
	});

	let starting = false;

	const onReady = () => {
		starting = false;
		done();
	};

	server.on('start', () => {
		starting = true;
		setTimeout(onReady, STARTUP_TIMEOUT);
	});

	server.on('stdout', (stdout) => {
	    process.stdout.write(stdout); // pass the stdout through
	    if (starting) {
	    	onReady();
	    }
	});
}

watch('./src/sass/**/*.scss', parallel(sass2css));

module.exports.default = series(doNodemon, doBrowserSync, sass2css);