var app = angular.module('autotest-admin', ['ngRoute', 'ngSanitize'])
    .run(["$rootScope","$location", function ($rootScope,$location) {

        $rootScope.userLogged = false;
        $rootScope.loading = true;

        middleware.init();

        $location.path('/login');

        middleware.users.onUserSignedIn = function(uid){ // Callback usuario logeado
            // Descargar configuracion actual
            middleware.db.getSorted("decisionTrees", "timestamp")
            .then(function(snapshot){
                $rootScope.config = {
                    trees: []
                };
                snapshot.forEach(function(tree){
                    var t = tree.val();
                    t.key = tree.key;
                    $rootScope.config.trees.push(t);
                });
                // Ir al tablero
                $rootScope.userLogged = true;
                $rootScope.loading = false;
                $location.path('/');
                $rootScope.$apply();
            })
            .catch(function(err){
                console.log(err);
            });
        };

        middleware.users.onUserSignedOut = function(){ // Callback usuario deslogeado
            $rootScope.userLogged = false;
            $rootScope.loading = false;
            $location.path('/login');
            $rootScope.$apply();
        };

        $rootScope.logout = function(){
            $rootScope.loading = true;
            middleware.users.signOut();
        };
    }])
    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "views/dashboard.html",
                controller: "dashboard"
            })
            .when("/login", {
                templateUrl: "views/login.html",
                controller: "login"
            })
            .when("/config", {
                templateUrl: "views/config.html",
                controller: "config"
            });
    }])
    .filter('trusted', ['$sce', function ($sce) {
        // Ver: https://stackoverflow.com/questions/39480969/angular-interpolateinterr-error-when-adding-url-from-variable
        return $sce.trustAsResourceUrl;
    }]);