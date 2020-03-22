// Instalacion de modulos:
// npm install gulp@3.9.1 del merge-stream gulp-bundle-assets gulp-ng-annotate gulp-rename gulp-replace

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
    { src: './src/assets/vendor/**/*', dest: './public/assets/vendor' },
    { src: './src/images/**/*', dest: './public/images' },
    { src: './src/probador/**/*', dest: './public/probador' },
    { src: './src/views/**/*', dest: './public/views' },
    { src: './src/style/**/*', dest: './public/style' },
    { src: './src/firebase-messaging-sw.js', dest: './public/' },
    { src: './src/manifest.json', dest: './public/' },
    { src: './src/pwabuilder-sw.js', dest: './public/' },
    { src: './src/pwabuilder-sw-register.js', dest: './public/' },
    { src: './src/manup.min.js', dest: './public/' },
    { src: './src/index.html', dest: './public/' }
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
    .pipe(replace('<script type="text/javascript" src="assets/custom/cipressus.js"></script>', '<script type="text/javascript" src="main.js?v=1"></script>'))
    .pipe(replace('<script type="text/javascript" src="assets/custom/cipressus-utils.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="assets/custom/cipressus-hardware.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="assets/custom/cipressus-test-fs.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/index.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/testResults.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/login.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/home.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/dashboard.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/calendar.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/sources.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/submissions.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/hardware.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/analizer.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/simulator.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/kMaps.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/tables.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/users.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/stats.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/attendance.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/activities.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/courses.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/editor.js"></script>', ''))
    .pipe(replace('<script type="text/javascript" src="controllers/profile.js"></script>', ''))
    .pipe(replace('<!-- ##################### CUSTOM LIB ##################### -->', ''))
    .pipe(replace('<!-- ##################### CONTROLLERS ##################### -->', ''))
    .pipe(gulp.dest('./public'));
});
