const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync').create();

function sass2css(done) {
	src("./src/sass/app.scss")
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(dest("./dist/css/"))
		.pipe(browserSync.stream());

	done();
}

function essix2js(done) {
	src("./src/js/*")
		.pipe(babel({presets: ['@babel/env']}))
		.pipe(uglify())
		.pipe(dest("./dist/js/"))
		.pipe(browserSync.stream());

	done();
}

function doBrowserSync() {
	browserSync.init({
        proxy: "http://localhost:3000",
        port: 4000
	});
}

function doNodemon(done) {
	const STARTUP_TIMEOUT = 5000;
	const server = nodemon({
		script: './app',
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
watch('./src/js/**/*.js', parallel(essix2js));

module.exports.convert = parallel(sass2css, essix2js);
module.exports.default = parallel(sass2css, essix2js, /*doNodemon,*/ doBrowserSync);