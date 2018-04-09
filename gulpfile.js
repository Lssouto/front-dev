//Imports
const gulp = require('gulp'),
      gulpLoadPlugins = require('gulp-load-plugins'),
      browserSync = require('browser-sync').create(),
      del = require('del'),
      runSequence = require('run-sequence'),
      $ = gulpLoadPlugins(),
      reload = browserSync.reload,
      assets = require('./assets'),
      config = require('./gulpfile-config'),
      babelify = require('babelify'),
      browserify = require('browserify'),
      source = require('vinyl-source-stream'),
      buffer = require('vinyl-buffer');

//State - Dev, Build, Export
let globalState = null;

//Sub-Tasks
gulp.task('styles', () => {
  return gulp.src(config.paths.app.scss + '/**/*.scss')
    .pipe($.plumber())
    .pipe($.if(globalState.state == "dev", $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.if(globalState.state == "dev", $.sourcemaps.write()))
    .pipe($.if(globalState.minify, $.cssnano({safe: true, autoprefixer: false})))
    .pipe(gulp.dest(globalState.dest.css))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return browserify({
      entries: config.paths.app.js +'/main.js',
      debug: true
    })
    .transform(babelify)
    .bundle()
    .pipe(source('main.js'))
    .pipe(buffer())  
    .pipe($.if(globalState.state == "dev", $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(globalState.state == "dev", $.sourcemaps.write('.')))
    .pipe($.if(globalState.minify, $.uglify({compress: {drop_console: true}})))
    .pipe(gulp.dest(globalState.dest.js))
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

gulp.task('html', () => {
  return gulp.src(config.paths.app.html + '/*.html')
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
    .pipe(gulp.dest(globalState.dest.base))
    .pipe(reload({stream: true}));
});

gulp.task('images', () => {
  return gulp.src(config.paths.app.images + '/**/*')
    .pipe($.if(globalState.minify,$.cache($.imagemin())))
    .pipe(gulp.dest(globalState.dest.images))
    .pipe(reload({stream: true}));
});

gulp.task('fonts', () => {
  return gulp.src(assets.fonts.map((index)=>{
      return index + '**/*.{eot,svg,ttf,woff,woff2}'
  }))
  .pipe(gulp.dest(globalState.dest.fonts))
  .pipe(reload({stream: true}));
});

gulp.task('extras', () => {
  return gulp.src([
    config.paths.app.base + '/*',
    '!app/*.html'
  ], {
    dot: true
  })
  .pipe(gulp.dest(globalState.dest.base));
});

gulp.task('split', ()=>{
    gulp.src(config.paths.app.base + '/*.html')
    .pipe($.htmlsplit())
    .pipe($.if(globalState.minify, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest(globalState.dest.html));
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

gulp.task('clean', del.bind(null, [config.paths.tmp.base, config.paths.dist.base]));

//Vendor Builds
gulp.task('vendor-styles',()=>{
  return gulp.src(assets.css)
    .pipe($.plumber())
    .pipe($.concat('vendor.css'))
    .pipe($.if(globalState !== "dev",$.cssnano({safe: true, autoprefixer: false})))
    .pipe(gulp.dest(globalState.dest.css));
});

gulp.task('vendor-scripts', ()=>{
  return gulp.src(assets.js)
    .pipe($.plumber())
    .pipe($.concat('vendor.js'))
    .pipe($.if(globalState !== "dev",$.uglify({compress: {drop_console: true}})))
    .pipe(gulp.dest(globalState.dest.js));
});
gulp.task('scss-export', ()=>{
  return gulp.src(config.paths.app.scss + '/**/*')
  .pipe(gulp.dest(globalState.dest.scss));
})
//Serve tasks
gulp.task('serve:dev', () => {

  globalState = config.gulpPutState.put('dev',false)
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

gulp.task('serve:export', ['export'], () => {

  gulp.watch(config.paths.app.images + '/**/*', ['images']);
  gulp.watch(config.paths.app.base + '/*.html', ['split']);
  gulp.watch(config.paths.app.scss + '/**/*.scss', ['styles']);
  gulp.watch(config.paths.app.js +'/**/*.js', ['scripts']);
  gulp.watch(config.paths.app.fonts  + '/**/*', ['fonts']);

});

gulp.task('serve:export-min', ['export-min'], () => {

  gulp.watch(config.paths.app.images + '/**/*', ['images']);
  gulp.watch(config.paths.app.base + '/*.html', ['split']);
  gulp.watch(config.paths.app.scss + '/**/*.scss', ['styles', 'scss-export']);
  gulp.watch(config.paths.app.js +'/**/*.js', ['scripts']);
  gulp.watch(config.paths.app.fonts  + '/**/*', ['fonts']);

});

gulp.task('serve:build', ['build'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: [globalState.dest.base],
    }
  });

  gulp.watch(config.paths.tmp.fonts + '/**/*', ['fonts']);
  gulp.watch(config.paths.app.images + '/**/*', ['images']);
  gulp.watch(config.paths.app.base + '/*.html', ['html']);
  gulp.watch(config.paths.app.scss + '/**/*.scss', ['styles']);
  gulp.watch(config.paths.app.js +'/**/*.js', ['scripts']);
  gulp.watch(config.paths.app.fonts  + '/**/*', ['fonts']);
});

//Main Tags
gulp.task('build', () => {
  globalState =  config.gulpPutState.put('build',true)
  runSequence(['lint', 'images', 'fonts', 'extras', 'vendor-scripts', 'vendor-styles' ,'styles', 'scripts', 'html'])
  return gulp.src(config.paths.dist.base + '/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('export',  ()=>{
  return new Promise(resolve => {
    globalState = config.gulpPutState.put('export',false)
    runSequence( ['html-extension'],['lint', 'images', 'fonts', 'extras', 'vendor-scripts', 'vendor-styles' ,'styles', 'scripts', 'scss-export' ],['split'] , resolve);
  });
});

gulp.task('export-min',  ()=>{
  return new Promise(resolve => {
    globalState = config.gulpPutState.put('export',true)
    runSequence( ['html-extension'],['lint', 'images', 'fonts', 'extras', 'vendor-scripts', 'vendor-styles' ,'styles', 'scripts'],['split'] , resolve);
  });
});

gulp.task('default', () => {
    console.log(
      '\n\n o/ Welcome, I will help you!'+
      '\n Type "gulp serve:dev" or "gulp serve:build"'+
      '\n\n --serve:dev: will just create a simple server with reload and file watching'+
      '\n --serve:build: will create a repo to minify and transfer the files so u can upload or sendo to someone'+
      '\n\n if you have something like an ready structure you can type "gulp serve:export" or "serve:export-min"'+
      '\n it will export all the files to where you configured on gulpfile-config.js '+
      '\n\n ^.^, you still can just type "gulp build", "gulp export", or "gulp export-min" if you want to run without the watch option. \n\n'
    )
});