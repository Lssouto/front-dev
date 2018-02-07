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
  return gulp.src(config.paths.app.scss + '/**/*.scss')
    .pipe($.plumber())
    .pipe($.if(gulpRunConfig.status == "dev", $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.if(gulpRunConfig.status == "dev", $.sourcemaps.write()))
    .pipe($.if(gulpRunConfig.minify, $.cssnano({safe: true, autoprefixer: false})))
    .pipe(gulp.dest(gulpRunConfig.dest.css))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src(config.paths.app.js +'/**/*.js')
    .pipe($.plumber())
    .pipe($.if(gulpRunConfig.status == "dev", $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(gulpRunConfig.status == "dev", $.sourcemaps.write('.')))
    .pipe($.if(gulpRunConfig.minify, $.uglify({compress: {drop_console: true}})))
    .pipe(gulp.dest(gulpRunConfig.dest.js))
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

//gulp.task('html', ['styles', 'scripts', 'vendor-scripts', 'vendor-styles'], () => {
gulp.task('html', () => {
  return gulp.src(config.paths.app.html + '/*.html')
    .pipe($.useref({searchPath: [config.paths.tmp.base, config.paths.app.base, '.']}))
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
    .pipe(gulp.dest(gulpRunConfig.dest.base))
    .pipe(reload({stream: true}));
});

gulp.task('images', () => {
  return gulp.src(config.paths.app.images + '/**/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest(gulpRunConfig.dest.images))
    .pipe(reload({stream: true}));
});

gulp.task('fonts', () => {
  return gulp.src(assets.fonts.map((index)=>{
      return index + '**/*.{eot,svg,ttf,woff,woff2}'
  }))
  .pipe(gulp.dest(gulpRunConfig.dest.fonts))
  .pipe(reload({stream: true}));
});

gulp.task('extras', () => {
  return gulp.src([
    config.paths.app.base + '/*',
    '!app/*.html'
  ], {
    dot: true
  })
  .pipe(gulp.dest(gulpRunConfig.dest.base));
});

gulp.task('vendor-styles',()=>{
  return gulp.src(assets.css)
    .pipe($.plumber())
    .pipe($.concat('vendor.css'))
    .pipe($.if(gulpRunConfig !== "dev",$.cssnano({safe: true, autoprefixer: false})))
    .pipe(gulp.dest(gulpRunConfig.dest.css));
});

gulp.task('vendor-scripts', ()=>{
  return gulp.src(assets.js)
    .pipe($.plumber())
    .pipe($.concat('vendor.js'))
    .pipe($.if(gulpRunConfig !== "dev",$.uglify({compress: {drop_console: true}})))
    .pipe(gulp.dest(gulpRunConfig.dest.js));
});

gulp.task('split', ()=>{
    gulp.src(config.paths.app.base + '/*.html')
    .pipe($.htmlsplit())
    .pipe(gulp.dest(gulpRunConfig.dest.html));
});

gulp.task('export-files', ['vendor-styles', 'vendor-scripts', 'fonts', 'styles' ,'images','scripts'], ()=>{
  return gulp.src([
    config.paths.app.base + '/**/*.*',
    config.paths.tmp.base + '/**/*.*'
  ])
  .pipe($.rename({dirname: ''}))
  .pipe($.if(/\.css$/,gulp.dest(gulpRunConfig.dest.css)))
  .pipe($.if(/\.scss$/,gulp.dest(gulpRunConfig.dest.scss)))
  .pipe($.if(/\.js$/,gulp.dest(gulpRunConfig.dest.js)))
  .pipe($.if(/\.(eot|svg|ttf|woff|woff2){1}$/,gulp.dest(gulpRunConfig.dest.fonts)));
});

gulp.task('html-extension', ()=>{
  let fileOld = config.options.export.fileOld
  let regExp = new RegExp('(<!--)\\s+(split)\\s+.+\\.('+fileOld+')\\s+(-->)','g')
  return gulp
  .src(config.paths.app.base + '/*.html')
  .pipe($.modifyFile((content, path, file) => {
    while( match = regExp.exec(content)) {
      content = content.replace(match[0], 
        match[0].replace('.'+ fileOld,
          config.options.export.fileNew
        )
      )
    }
    return content
  }))
  .pipe(gulp.dest(config.paths.app.base))
});


gulp.task('clean', del.bind(null, [config.paths.tmp.base, config.paths.dist.base, config.paths.export.base]));

gulp.task('serve:dev', () => {
  changeState('dev',false)
  runSequence(['clean'], ['styles', 'scripts', 'fonts', 'vendor-scripts', 'vendor-styles'], () => {
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

gulp.task('serve:export', () => {
  changeState('export',false)
  runSequence(['export'], () => {

    gulp.watch(config.paths.tmp.fonts + '/**/*', ['fonts']);
    gulp.watch(config.paths.app.images + '/**/*', ['images']);
    gulp.watch(config.paths.app.base + '/*.html', ['html']);
    gulp.watch(config.paths.app.scss + '/**/*.scss', ['styles']);
    gulp.watch(config.paths.app.js +'/**/*.js', ['scripts']);
    gulp.watch(config.paths.app.fonts  + '/**/*', ['fonts']);
  });
});

gulp.task('serve:export-min', () => {
  changeState('export',true)
  runSequence(['export'], () => {

    gulp.watch(config.paths.tmp.fonts + '/**/*', ['fonts']);
    gulp.watch(config.paths.app.images + '/**/*', ['images']);
    gulp.watch(config.paths.app.base + '/*.html', ['html']);
    gulp.watch(config.paths.app.scss + '/**/*.scss', ['styles']);
    gulp.watch(config.paths.app.js +'/**/*.js', ['scripts']);
    gulp.watch(config.paths.app.fonts  + '/**/*', ['fonts']);
  });
});

gulp.task('serve:build', () => {
  changeState('build',true)
  runSequence(['build'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: [gulpRunConfig.dest.base],
      }
    });

    gulp.watch(config.paths.tmp.fonts + '/**/*', ['fonts']);
    gulp.watch(config.paths.app.images + '/**/*', ['images']);
    gulp.watch(config.paths.app.base + '/*.html', ['html']);
    gulp.watch(config.paths.app.scss + '/**/*.scss', ['styles']);
    gulp.watch(config.paths.app.js +'/**/*.js', ['scripts']);
    gulp.watch(config.paths.app.fonts  + '/**/*', ['fonts']);
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

gulp.task('build', () => {
  runSequence(['lint', 'images', 'fonts', 'extras', 'styles', 'scripts', 'vendor-scripts', 'vendor-styles'], ['html'])
  dev = false;
  return gulp.src(config.paths.dist.base + '/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('export',  ()=>{
  return new Promise(resolve => {
    changeState('export',false)
    runSequence(['clean'], ['html-extension'],[ 'split', 'export-files'] , resolve);
  });
});

gulp.task('export-min',  ()=>{
  return new Promise(resolve => {
    changeState('export',true)
    runSequence(['clean'], ['html-extension'],[ 'split', 'export-files'] , resolve);
  });
});

gulp.task('default', () => {
  return new Promise(resolve => {
    changeState('build',true)
    runSequence(['clean'], 'build', resolve);
  });
});

let gulpRunConfig = {
  state: '', //dev,build,export
  minify: false,
  dest : {

  }
}

function changeState(state,min){
  gulpRunConfig.state = state;
  gulpRunConfig.minify = min;

  switch (state){

    case "export":
    gulpRunConfig.dest = config.paths.export;
    break;

    case "build":
    gulpRunConfig.dest = config.paths.dist;
    break;

    default:
    gulpRunConfig.dest = config.paths.tmp;
    break;

  }
  //console.log(gulpRunConfig)
}

gulp.task('watch',function(){
  runSequence(['clean'], ['styles', 'scripts', 'fonts', 'vendor-scripts', 'vendor-styles'], () => {
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