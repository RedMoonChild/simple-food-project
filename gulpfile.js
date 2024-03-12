  const {src, dest, watch, parallel, series} = require('gulp');

  const scss = require('gulp-sass')(require('sass'));
  const concat = require('gulp-concat');
  const uglify = require('gulp-uglify-es').default;
  const browserSync = require('browser-sync').create();
  const autoprefixer = require('gulp-autoprefixer');
  const clean = require('gulp-clean');
  const avif = require('gulp-avif');
  const webp = require('gulp-webp');
  const imagemin = require('gulp-imagemin');
  const newer = require('gulp-newer');
  const svgFilter = require('gulp-filter'); 
  const gulpif = require('gulp-if');
  const svgSprite = require('gulp-svg-sprite');
  const cheerio = require('gulp-cheerio');
  const replace = require('gulp-replace');
  const fonter = require('gulp-fonter');
  const ttf2woff2 = require('gulp-ttf2woff2');
  const plumber = require('gulp-plumber');
  // const include = require('gulp-include');
  const fileInclude  = require('gulp-file-include');

  // function pages() {
  //   return src('app/pages/*.html')
  //     .pipe(include({
  //       includePaths: 'app/components'
  //     }))
  //     .pipe(dest('app'))
  //     .pipe(browserSync.stream())
  // }

  const htmlInclude = () => {
    return src(['app/html/*.html']) // Находит любой .html файл в папке "html", куда будем подключать другие .html файлы													
    .pipe(fileInclude({
      prefix: '@',
      basepath: '@file',
    }))
    .pipe(dest('app')) // указываем, в какую папку поместить готовый файл html
    .pipe(browserSync.stream());
  }


  function fonts () {
    return src('app/fonts/src/*.*')
      .pipe(plumber())
      .pipe(fonter({
        formats: ['woff', 'ttf']
      }))
      .pipe(src('app/fonts/*.ttf'))
      .pipe(ttf2woff2())
      .pipe(dest('app/fonts'))
  }

  function images() {
    return src(['app/images/src/*.*', '!app/images/icons'])
      .pipe(newer('app/images'))
      .pipe(avif({ quality: 50 }))

      .pipe(src('app/images/src/*.*'))
      .pipe(newer('app/images'))
      .pipe(webp())

      .pipe(src('app/images/src/*.*'))
      .pipe(newer('app/images'))
      .pipe(imagemin())

      .pipe(dest('app/images'))
  }

  function sprite() {
    return src('app/images/icons/*.svg') 
    .pipe(cheerio({
          run: ($) => {
              $("[fill]").removeAttr("fill"); 
              $("[stroke]").removeAttr("stroke"); 
              $("[style]").removeAttr("style"); 
          },
          parserOptions: { xmlMode: true },
        })
    )
    .pipe(replace('&gt;','>')) // боремся с заменой символа 
    .pipe(
          svgSprite({
            mode: {
              stack: {
                sprite: '../sprite.svg', 
                example: true
              },
            },
          })
        )
    .pipe(dest('app/images/sprite')); 
  }

  function scripts() {
    return src([
      'node_modules/jquery/dist/jquery.js',
      'node_modules/mixitup/dist/mixitup.js',
      'node_modules/slick-carousel/slick/slick.js',
      'app/js/main.js'
    ])
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(dest('app/js'))
      .pipe(browserSync.stream())
  }

  function styles() {
    return src('app/scss/style.scss')
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 versions'],
        grid: true,
      }))
      .pipe(concat('style.min.css'))
      .pipe(scss({ outputStyle: 'compressed' }))
      .pipe(dest('app/css'))
      .pipe(browserSync.stream())
  }

  function watching() {
    browserSync.init({
      server: {
        baseDir: "app/"
      },
      notify: false
    });
    watch(['app/scss/**/*.scss'], styles)
    watch(['app/images/src'], images)
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)
    // watch(['app/components/*', 'app/pages/*'], pages)
    watch(['app/html/**/*.html'], htmlInclude)
    watch(['app/*.html']).on('change', browserSync.reload)
  }

  function cleanDist() {
    return src('dist')
      .pipe(clean())
  }

  function building() {
    return src([
      'app/css/style.min.css',
      'app/images/*.*',
      '!app/images/*.svg',
      'app/images/sprite.svg',
      'app/fonts/*.*',
      'app/js/main.min.js'
      // 'app/pages/*.html'
    ], {base: 'app'})
      .pipe(dest('dist'))
  }

  exports.styles = styles;
  exports.images = images;
  exports.fonts = fonts;
  // exports.pages = pages;
  exports.building = building;
  exports.sprite = sprite;
  exports.scripts = scripts;
  exports.watching = watching;
  exports.htmlInclude = htmlInclude;

  exports.build = series(cleanDist, building);
  exports.default = parallel(htmlInclude, styles, images, scripts, watching);
