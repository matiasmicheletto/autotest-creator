// bundle.config.js
module.exports = {
    bundle: {
      main: {
        scripts: [
          'app/custom/js/middleware.js',
          'app/custom/js/middleware-db.js',
          'app/custom/js/middleware-firestore.js',
          'app/custom/js/app.js',
          'app/controllers/home.js',
          'app/controllers/autotest.js'
        ]
      }
    }
  };