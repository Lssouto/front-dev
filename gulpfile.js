const gulp = require('gulp'),
      gulpLoadPlugins = require('gulp-load-plugins'),
      browserSync = require('browser-sync').create(),
      del = require('del'),
      runSequence = require('run-sequence'),
      $ = gulpLoadPlugins(),
      reload = browserSync.reload,
      assets = require('./assets'),
      config = require('./gulpfile-config');
      
let dev = true;

gulp.task('styles', () => {
  return gulp.src(config.paths.app.scss + '/*.scss')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest(config.paths.tmp.css))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src(config.paths.app.js +'/**/*.js')
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe(gulp.dest(config.paths.tmp.js))
    .pipe(reload({stream: true}));
});

function lint(files) {
  return gulp.src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint(config.paths.app.js +'/**/*.js')
    .pipe(gulp.dest(config.paths.app.js +''));
});

gulp.task('html', ['styles', 'scripts', 'vendor-js', 'vendor-css'], () => {
  return gulp.src(config.paths.app.html + '/*.html')
    .pipe($.useref({searchPath: [config.paths.tmp.base, config.paths.app.base, '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.css$/, $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest(config.paths.dist.base));
});

gulp.task('images', () => {
  return gulp.src(config.paths.app.images + '/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest(config.paths.dist.images));
});

gulp.task('fonts', () => {
  return gulp.src(assets.fonts.map((pos)=>{
      return pos + '**/*.{eot,svg,ttf,woff,woff2}'
  })).pipe($.if(dev, gulp.dest(config.paths.tmp.fonts), gulp.dest(config.paths.dist.fonts)));
});

gulp.task('extras', () => {
  return gulp.src([
    config.paths.app.base + '/*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest(config.paths.dist.base));
});

gulp.task('vendor-css',()=>{
  return gulp.src(assets.css)
    .pipe($.plumber())
    .pipe($.concat('vendor.css'))
   .pipe($.if(dev, gulp.dest(config.paths.tmp.css), gulp.dest(config.paths.dist.css)));
});

gulp.task('vendor-js', ()=>{
  return gulp.src(assets.js)
    .pipe($.plumber())
    .pipe($.concat('vendor.js'))
    .pipe($.if(dev, gulp.dest(config.paths.tmp.js), gulp.dest(config.paths.dist.js)));
});


gulp.task('clean', del.bind(null, [config.paths.tmp.base, config.paths.dist.base]));

gulp.task('serve', () => {
  runSequence(['clean'], ['styles', 'scripts', 'fonts', 'vendor-js', 'vendor-css'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: [config.paths.tmp.base, config.paths.app.base],
      }
    });

    gulp.watch([
      'app/*.html',
      'app/images/**/*',
      '.tmp/fonts/**/*'
    ]).on('change', reload);

    gulp.watch(config.paths.app.scss + '/**/*.scss', ['styles']);
    gulp.watch(config.paths.app.js +'/**/*.js', ['scripts']);
    gulp.watch('app/fonts/**/*', ['fonts']);
  });
});

gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: [config.paths.dist.base]
    }
  });
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src(config.paths.dist.base + '/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean'], 'build', resolve);
  });
});
