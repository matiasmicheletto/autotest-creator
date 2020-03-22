// Instalacion de modulos:
// $ npm install gulp@3.9.1 del merge-stream gulp-bundle-assets gulp-ng-annotate gulp-rename gulp-replace
// Para ubuntu:
// $ export PATH=~/.npm-global/bin:$PATH

const gulp = require('gulp');
const del = require('del');
const merge = require('merge-stream');
const bundle = require('gulp-bundle-assets');
const ngAnnotate = require('gulp-ng-annotate');
const rename = require("gulp-rename");
const replace = require("gulp-replace");

// Limpiar el directorio public borrando todo
gulp.task('clean', function(){
  return del('./public/**', {force:true});
});

// Copiar librerias, vistas, manifest, configuraciones e index.html a la carpeta de produccion
gulp.task('copy', function () {
  var paths = [
    { src: './app/views/**/*', dest: './public/views' },
    { src: './app/vendor/**/*', dest: './public/vendor' },
    { src: './app/custom/css/**/*', dest: './public/custom/css' },
    { src: './app/custom/img/**/*', dest: './public/custom/img' },
    { src: './app/manifest.json', dest: './public/' },
    { src: './app/pwabuilder-sw.js', dest: './public/' },
    { src: './app/manup.min.js', dest: './public/' },
    { src: './app/index.html', dest: './public/' }
  ];

  var tasks = paths.map(function (path) {
    return gulp.src(path.src).pipe(gulp.dest(path.dest));
  });

  return merge(tasks);
});

// Combinar y comprimir controllers
gulp.task('bundle', function() {
  return gulp.src('./bundle.config.js')
    .pipe(ngAnnotate())
    .pipe(bundle())
    .pipe(gulp.dest('./public'));
});

// Cambiar el nombre del archivo de controllers (porque genera con nombres diferentes con hash)
gulp.task('rename',function(){
  return gulp.src("./public/main-*")
  .pipe(rename("main.js"))
  //.pipe(del('./public/main-*',{force:true})) // Esto da error, habria que poner el tarea aparte
  .pipe(gulp.dest("./public")); 
});

// Reemplazar dependencias que se importan en el index.html y alternar version de test por produccion
gulp.task('replace', function(){
  gulp.src(['./public/index.html'])
    .pipe(replace('<script type="text/javascript" src="custom/js/middleware.js"></script>', '<script type="text/javascript" src="main.js?v=1"></script>'))
    .pipe(replace('<script type="text/javascript" src="custom/js/middleware-db.js"></script>', ''))
	  .pipe(replace('<script type="text/javascript" src="custom/js/middleware-firestore.js"></script>', ''))
	  .pipe(replace('<script type="text/javascript" src="custom/js/app.js"></script>', ''))
	  .pipe(replace('<script type="text/javascript" src="controllers/home.js"></script>', ''))
	  .pipe(replace('<script type="text/javascript" src="controllers/autotest.js"></script>', ''))
    .pipe(gulp.dest('./public'));
});
