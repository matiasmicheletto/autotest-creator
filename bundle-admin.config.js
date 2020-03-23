// bundle.config.js
module.exports = {
    bundle: {
      main: {
        scripts: [
          'admin/custom/js/middleware.js',
          'admin/custom/js/middleware-users.js',
          'admin/custom/js/middleware-db.js',
          'admin/custom/js/middleware-firestore.js',
          'admin/custom/js/init.js',
          'admin/controllers/login.js',
          'admin/controllers/dashboard.js',
          'admin/controllers/config.js'
        ]
      }
    }
  };